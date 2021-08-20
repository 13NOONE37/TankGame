import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import createCube from './ObjectsGenerate/createCube';
import controler from './Control/controler';

import { BufferAttribute } from 'three';

//Configruation

//fps
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//Loaders
const loaderManager = new THREE.LoadingManager(
  (e) => {
    console.log('loaded');
    updateAllMaterials();
  },
  (e) => {
    console.log('progress');
  },
  (e) => {
    console.log('error');
  },
);

const textureLoader = new THREE.TextureLoader(loaderManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loaderManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
const gltfLoader = new GLTFLoader(loaderManager);
gltfLoader.setDRACOLoader(dracoLoader);

//Control panel
const debugObject = {};
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

//Scene
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener('resize', () => {
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera ratio
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
//Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(2, 2, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
// controls.minDistance = 5;
// controls.maxDistance = 15;

//Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

//Update all materials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = envMap;
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

//textures
const envMap = cubeTextureLoader.load([
  '/Textures/environmentMaps/0/px.jpg',
  '/Textures/environmentMaps/0/nx.jpg',
  '/Textures/environmentMaps/0/py.jpg',
  '/Textures/environmentMaps/0/ny.jpg',
  '/Textures/environmentMaps/0/pz.jpg',
  '/Textures/environmentMaps/0/nz.jpg',
]);
envMap.encoding = THREE.sRGBEncoding;
scene.background = envMap;
scene.environment = envMap;
debugObject.envMapIntensity = 5;

//models
let tank;
gltfLoader.load('./Models/tank.glb', (model) => {
  tank = model.scene;
  console.log(tank);
  scene.add(tank);
});
debugObject.tubeRotation = -1.5707962925663566;
debugObject.isRunning = false;
debugObject.isGoForward = false;
debugObject.isGoBackward = false;
debugObject.isGoLeft = false;
debugObject.isGoRight = false;
debugObject.tankVelocity = 0;

//control
controler(debugObject);

gui
  .add(debugObject, 'tubeRotation')
  .name('tubeRotation')
  .min(-1.5707962925663566)
  .max(-1)
  .step(0.001);
gui
  .add(debugObject, 'envMapIntensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('env intenstity');

//
//
//
//Content

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
const directionalLight = new THREE.PointLight(0xffffff, 35);
directionalLight.position.set(25, 40, 25);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2024;
directionalLight.shadow.mapSize.height = 2024;
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

gui
  .add(directionalLight.position, 'x')
  .min(-20)
  .max(20)
  .step(0.1)
  .name('Directional light X');
gui
  .add(directionalLight.position, 'y')
  .min(0)
  .max(40)
  .step(0.1)
  .name('Directional light Y');
gui
  .add(directionalLight.position, 'z')
  .min(-20)
  .max(20)
  .step(0.1)
  .name('Directional light Z');
gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(100)
  .step(0.001)
  .name('Directional light intensity');

// Floor

const floorAmbientTexture = textureLoader.load(
  './Textures/floor/ambientOcclusion.jpg',
);
const floorBaseColor = textureLoader.load('./Textures/floor/basecolor.jpg');
floorBaseColor.wrapS = THREE.RepeatWrapping;
floorBaseColor.wrapT = THREE.RepeatWrapping;
floorBaseColor.repeat.set(18, 18);

const floorHeight = textureLoader.load('./Textures/floor/height.png');
floorHeight.wrapS = THREE.RepeatWrapping;
floorHeight.wrapT = THREE.RepeatWrapping;
floorHeight.repeat.set(18, 18);

const floorNormal = textureLoader.load('./Textures/floor/normal.jpg');
floorNormal.wrapS = THREE.RepeatWrapping;
floorNormal.wrapT = THREE.RepeatWrapping;
floorNormal.repeat.set(18, 18);

const floorRoughness = textureLoader.load('./Textures/floor/roughness.jpg');

const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({
  displacementMap: floorHeight,
  displacementScale: 0.3,
  aoMap: floorAmbientTexture,
  aoMapIntensity: 2,
  map: floorBaseColor,
  normalMap: floorNormal,
  roughnessMap: floorRoughness,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.geometry.setAttribute(
  'uv2',
  new BufferAttribute(floor.geometry.attributes.uv.array, 2),
);
floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

//
//
//
//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  stats.begin();

  if (tank) {
    camera.lookAt(tank.position);
    tank.children[2].rotation.z = debugObject.tubeRotation;
    if (debugObject.isGoForward) {
      tank.position.x -= Math.sin(elapsedTime * 0.05);
      if (debugObject.isGoLeft) {
        tank.rotation.y += elapsedTime * 0.01;
      }
    }
    if (debugObject.isGoBackward) {
      tank.position.x += Math.sin(elapsedTime * 0.05);
    }
  }

  // Update controls
  controls.update();
  //Update renderer
  renderer.render(scene, camera);

  stats.end();
  requestAnimationFrame(tick);
};
tick();
