import './style.css'
import * as THREE from 'three'
import { getProject , types } from '@theatre/core'
import studio from '@theatre/studio'
import projectState from './state.json'


// Initialize Theatre Studio
studio.initialize();

// Create a project for the animation
const project = getProject('THREE.js x Theatre.js', {
  state: projectState,
  assets: {
    baseUrl: '/theatrejs-assets', // Define the base URL for assets
  },
});

// Create a sheet for the animation sequence
const sheet = project.sheet('Animated scene');

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  10,
  200,
);
camera.position.z = 50;

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Geometry and Material (TorusKnot)
 */
const geometry = new THREE.BoxGeometry(3, 30 , 15);
const material = new THREE.MeshStandardMaterial({ color: '#f00' });
material.color = new THREE.Color('#049ef4');
material.roughness = 0.5;

const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// Create a Theatre.js object with animatable properties
const torusKnotObj = sheet.object('Torus Knot', {
  rotation: types.compound({
    x: types.number(mesh.rotation.x, { range: [-2, 2] }),
    y: types.number(mesh.rotation.y, { range: [-2, 2] }),
    z: types.number(mesh.rotation.z, { range: [-2, 2] }),
  }),
  scale: types.compound({
    z_scale: types.number(mesh.scale.z, { range: [0, 4] }),
  }),
  texture: types.image('1.png', { // Default texture
    label: 'TEXTURE',
  }),
  position: types.compound({
    x_axis: types.number(mesh.position.x, { range: [-4, 4] }),
    y_axis: types.number(mesh.position.y, { range: [-4, 4] }),
    z_axis: types.number(mesh.position.z, { range: [-4, 4] }),
  }),
});

// Wait for the project to be ready, then set up texture handling
project.ready.then(() => {
  torusKnotObj.onValuesChange((values) => {
    const { x, y, z } = values.rotation;
    const { z_scale } = values.scale;
    const {x_axis , y_axis , z_axis} = values.position;

     // Check if `values.texture` is defined before calling `getAssetUrl`
    //  if (values.texture) {
    //   const textureUrl = project.getAssetUrl(values.texture);
      
      // Ensure textureUrl is not undefined
      // if (textureUrl) {
      //   // Load the texture
      //   const textureLoader = new THREE.TextureLoader();
      //   textureLoader.load(textureUrl, (texture) => {
      //     mesh.material.map = texture;
      //     mesh.material.needsUpdate = true;
      //   });
      // } 
    //}

    // Apply rotation and scale changes
    mesh.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI);
    mesh.scale.set(z_scale, z_scale, z_scale);
    mesh.position.set(x_axis , y_axis , z_axis);
  });
 


  // Play the animation sequence indefinitely
  sheet.sequence.play({ iterationCount: Infinity });
});

/**
 * Lighting Setup
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ff0000', 30);
directionalLight.position.set(0, 20, 20);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLightObj = sheet.object("Directional Light", {
  intensity: types.number(directionalLight.intensity, { range: [0, 30] }),
});

directionalLightObj.onValuesChange((values) => {
  directionalLight.intensity = values.intensity;
});

// Rect Area Light
const rectAreaLight = new THREE.RectAreaLight('#ff0', 1, 50, 50);
rectAreaLight.position.set(-20, -40, 10);
rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(rectAreaLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);
document.body.appendChild(renderer.domElement);

/**
 * Animation Loop
 */
function tick() {
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();

/**
 * Handle Window Resize
 */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}, false);
