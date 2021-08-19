import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

//Configruation

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
controls.minDistance = 5;
controls.maxDistance = 15;

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
  camera.lookAt(tank.position);
});

debugObject.tubeRotation = -1.5707962925663566;
debugObject.isRunning = false;
debugObject.isGoForward = false;
debugObject.isGoBackward = false;
debugObject.isGoLeft = false;
debugObject.isGoRight = false;
debugObject.tankVelocity = 0;

window.addEventListener('keydown', ({ keyCode }) => {
  switch (keyCode) {
    case 69: {
      console.log('toggle engine');
      break;
    }
    case 87: {
      console.log('move forward');
      debugObject.isGoForward = true;
      // tank.position.x -= 0.05;
      break;
    }
    case 83: {
      console.log('move backward');
      debugObject.isGoBackward = true;
      // tank.position.x += 0.05;
      break;
    }
    case 65: {
      console.log('move left');
      debugObject.isGoLeft = true;
      // tank.rotation.y += 0.05;
      break;
    }
    case 68: {
      console.log('move right');
      debugObject.isGoRight = true;
      // tank.rotation.y -= 0.05;
      break;
    }
    case 32: {
      console.log('brake');
      break;
    }
    case 16: {
      console.log('boost');
      break;
    }
  }
});
window.addEventListener('keyup', ({ keyCode }) => {
  switch (keyCode) {
    case 69: {
      console.log('toggle engine');
      break;
    }
    case 87: {
      console.log('move forward');
      debugObject.isGoForward = false;

      break;
    }
    case 83: {
      console.log('move backward');
      debugObject.isGoBackward = false;
      break;
    }
    case 65: {
      console.log('move left');
      debugObject.isGoLeft = false;
      break;
    }
    case 68: {
      console.log('move right');
      debugObject.isGoRight = false;
      break;
    }
    case 32: {
      console.log('brake');
      break;
    }
    case 16: {
      console.log('boost');
      break;
    }
  }
});

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
const directionalLight = new THREE.PointLight(0xffffff, 15);
directionalLight.position.set(5, 5, 15);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2024;
directionalLight.shadow.mapSize.height = 2024;
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

// Floor

const floorAmbientTexture = textureLoader.load(
  './Textures/floor/ambientOcclusion.jpg',
);
const floorBaseColor = textureLoader.load('./Textures/floor/basecolor.jpg');
floorBaseColor.wrapS = THREE.RepeatWrapping;
floorBaseColor.wrapT = THREE.RepeatWrapping;
floorBaseColor.repeat.set(8, 8);

const floorHeight = textureLoader.load('./Textures/floor/height.png');
const floorNormal = textureLoader.load('./Textures/floor/normal.jpg');
floorNormal.wrapS = THREE.RepeatWrapping;
floorNormal.wrapT = THREE.RepeatWrapping;
floorNormal.repeat.set(8, 8);
const floorRoughness = textureLoader.load('./Textures/floor/roughness.jpg');
// floorBaseColor.wrapS = THREE.RepeatWrapping;
// floorBaseColor.wrapT = THREE.RepeatWrapping;
// floorBaseColor.repeat.set(8, 8);

const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({
  // displacementMap: floorHeight,
  // displacementScale: 0.1,
  aoMap: floorAmbientTexture,
  map: floorBaseColor,
  normalMap: floorNormal,
  roughnessMap: floorRoughness,
});
floorMaterial.texture;
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

//
//
//
//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (tank) {
    tank.children[2].rotation.z = debugObject.tubeRotation;
    if (debugObject.isGoForward) {
      tank.position.x -= Math.sin(elapsedTime * 0.05);
    }
    if (debugObject.isGoBackward) {
      tank.position.x += Math.sin(elapsedTime * 0.05);
    }
  }

  // Update controls
  controls.update();
  //Update renderer
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};
tick();
