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
let isLoaded = false;
const loaderManager = new THREE.LoadingManager(
  (e) => {
    console.log('loaded');
    isLoaded = true;
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
  1000,
);
camera.position.set(2, 2, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;
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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

debugObject.tubeRotation = -1.5707962925663566;
debugObject.isRunning = false;
debugObject.isGoForward = false;
debugObject.isGoBackward = false;
debugObject.isGoLeft = false;
debugObject.isGoRight = false;
debugObject.tankVelocity = 0;
debugObject.tankMaxVelocity = 1;

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
const ambientLight = new THREE.AmbientLight(0x8a72d4, 0.1);
scene.add(ambientLight);
const directionalLight = new THREE.PointLight(0xffeeff, 150);
directionalLight.position.set(2, 40, -20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024 * 2;
directionalLight.shadow.mapSize.height = 1024 * 2;
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
  .min(50)
  .max(200)
  .step(0.1)
  .name('Directional light intensity');

// Floor

/*const floorAmbientTexture = textureLoader.load(
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

const floorRoughness = textureLoader.load('./Textures/floor/roughness.jpg');*/

//Physics
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world); // podzieli  wszystko na siatke i bedzie sprawdzalo kolizje tylko z tymi najblizszymi
world.gravity.set(0, -9.82, 0);
world.allowSleep = true;

const defaultMaterial = new CANNON.Material('default');

const contactDefaultMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    fiction: 0,
    restitution: 0.2,
  },
);
world.defaultContactMaterial = contactDefaultMaterial;

const objectsToUpdate = [];

const createSides = (x) => {
  //Apperance
  const sideGeometry = new THREE.PlaneBufferGeometry(x, x);
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a72d4,
    // side: THREE.DoubleSide,
  });
  const sides = new THREE.Group();

  const sideBottom = new THREE.Mesh(sideGeometry, sideMaterial);
  sideBottom.rotateX(-Math.PI * 0.5);
  sides.add(sideBottom);

  const sideLeft = new THREE.Mesh(sideGeometry, sideMaterial);
  sideLeft.position.z -= x / 2;
  sideLeft.position.y += x / 2;
  sides.add(sideLeft);

  const sideRight = new THREE.Mesh(sideGeometry, sideMaterial);
  sideRight.position.z += x / 2;
  sideRight.rotation.y = Math.PI;
  sideRight.position.y += x / 2;
  sides.add(sideRight);

  const sideFront = new THREE.Mesh(sideGeometry, sideMaterial);
  sideFront.position.x -= x / 2;
  sideFront.rotation.y = Math.PI / 2;
  sideFront.position.y += x / 2;
  sides.add(sideFront);

  const sideBack = new THREE.Mesh(sideGeometry, sideMaterial);
  sideBack.position.x += x / 2;
  sideBack.rotation.y = -Math.PI / 2;
  sideBack.position.y += x / 2;
  sides.add(sideBack);

  scene.add(sides);

  //Physics

  //Bottom
  const sideBottomShape = new CANNON.Plane();
  const sideBottomBody = new CANNON.Body({
    mass: 0,
    shape: sideBottomShape,
  });
  sideBottomBody.position.y -= 0;
  sideBottomBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5,
  ); // pierwszy argument to oś według której obracamy a drugi to stopień

  world.addBody(sideBottomBody);

  // //Left
  const sideLeftShape = new CANNON.Plane();
  const sideLeftBody = new CANNON.Body({
    mass: 0,
    shape: sideLeftShape,
  });
  sideLeftBody.position.z -= x / 2;
  world.addBody(sideLeftBody);

  // //Right
  const sideRightShape = new CANNON.Plane();
  const sideRightBody = new CANNON.Body({
    mass: 0,
    shape: sideRightShape,
  });
  sideRightBody.position.z += x / 2;
  sideRightBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI);
  world.addBody(sideRightBody);

  // //Front
  const sideFrontShape = new CANNON.Plane();
  const sideFrontBody = new CANNON.Body({
    mass: 0,
    shape: sideFrontShape,
  });
  sideFrontBody.position.x -= x / 2;
  sideFrontBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(0, 1, 0),
    Math.PI / 2,
  );
  world.addBody(sideFrontBody);

  //Back
  const sideBackShape = new CANNON.Plane();
  const sideBackBody = new CANNON.Body({
    mass: 0,
    shape: sideBackShape,
  });
  sideBackBody.position.x += x / 2;
  sideBackBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(0, 1, 0),
    -Math.PI / 2,
  );
  world.addBody(sideBackBody);
};
createSides(300);

// Tank
let tankMesh;
const createTank = () => {
  //Physics
  //dodac lufe https://schteppe.github.io/cannon.js/docs/classes/PointToPointConstraint.html
  const tankShape = new CANNON.Box(new CANNON.Vec3(2.35, 3.1, 2.1));
  const tankBody = new CANNON.Body({
    mass: 150,
    shape: tankShape,
  });
  tankBody.position.set(0, 0, 0);
  world.addBody(tankBody);

  //Threejs

  gltfLoader.load('./Models/tank.glb', (model) => {
    tankMesh = model.scene;
    scene.add(tankMesh);
    objectsToUpdate.push({ mesh: tankMesh, body: tankBody, name: 'tank' });
  });
};
createTank();

//Test
const boxMesh = new THREE.Mesh(
  new THREE.BoxBufferGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial(),
);
boxMesh.position.y = 35;
scene.add(boxMesh);

const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
const boxBody = new CANNON.Body({
  mass: 50,
  shape: boxShape,
});
boxBody.position.y = 0;

world.addBody(boxBody);
objectsToUpdate.push({ mesh: boxMesh, body: boxBody });

//
//
//
//Animate
const clock = new THREE.Clock();
let oldTime = 0; //we need this to calc delta for physics

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldTime;
  oldTime = elapsedTime;

  stats.begin();

  if (isLoaded) {
    //Update physics
    world.step(1 / 60, deltaTime, 3);
    objectsToUpdate.forEach((object) => {
      object.mesh.position.copy(object.body.position);
      object.mesh.quaternion.copy(object.body.quaternion);
    });

    // if (isLoaded) {
    //   camera.lookAt(tank.position);
    //   tank.children[2].rotation.z = debugObject.tubeRotation;
    //   if (debugObject.isGoForward) {
    //     tank.translateX(-elapsedTime * 0.001);
    //   }
    //   if (debugObject.isGoBackward) {
    //     tank.translateX(elapsedTime * 0.001);
    //   }
    //   if (debugObject.isGoLeft) {
    //     tank.rotation.y += elapsedTime * 0.001;
    //   }
    //   if (debugObject.isGoRight) {
    //     tank.rotation.y -= elapsedTime * 0.001;
    //   }
    // }
  }

  // Update controls
  controls.update();
  //Update renderer
  renderer.render(scene, camera);

  stats.end();
  requestAnimationFrame(tick);
};
tick();
