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

//Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//textures

//models
let tank;
gltfLoader.load('./Models/tank.glb', (model) => {
  tank = model.scene;
  console.log(tank);
  scene.add(tank);
  camera.lookAt(tank.position);
});

const debugObject = {
  tubeRotation: -1.5707962925663566,
};

gui
  .add(debugObject, 'tubeRotation')
  .name('tubeRotation')
  .min(-1.5707962925663566)
  .max(-1)
  .step(0.001);

//Content
const pointLight = new THREE.PointLight(0xbbbbbb);
pointLight.position.z = 15;
pointLight.position.y = 5;
scene.add(pointLight);

const floorGeometry = new THREE.PlaneBufferGeometry(10, 10);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (tank) {
    // tank.position.x = Math.sin(elapsedTime) * 2;
    // tank.position.z = Math.cos(elapsedTime) * 2;
    // tank.rotation.y = elapsedTime;
    tank.children[2].rotation.z = debugObject.tubeRotation;
  }
  // Update controls
  controls.update();
  //Update renderer
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};
tick();
