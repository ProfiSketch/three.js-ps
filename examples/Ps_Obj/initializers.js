import * as THREE from "three";
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initFloor() {
  const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 10, 10),
      new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
        wireframe:true
        
      })
  )
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI * 0.5;
  return floor;
}

export function initDirectionalLight(){
  const directionalLight = new THREE.DirectionalLight(0xffeeff, 0.5)
  // directionalLight.castShadow = true
  // directionalLight.shadow.mapSize.set(1024, 1024)
  // directionalLight.shadow.camera.far = 15
  // directionalLight.shadow.camera.left = -7
  // directionalLight.shadow.camera.top = 7
  // directionalLight.shadow.camera.right = 7
  // directionalLight.shadow.camera.bottom = -7
  // directionalLight.position.set(1, 1, 1)
  return directionalLight
}

export function initAmbientLight(){
  return new THREE.HemisphereLight(0xffffbb,0x080820, 1)
}

export function initRenderer(canvas, sizes){
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputEncoding = THREE.sRGBEncoding;

  return renderer;
}

export function initCamera(sizes){
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.set(15, 15, 15);
  return camera;
}

export function initControls(camera, canvas){
  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 0.75, 0)
  controls.enableDamping = true
  return controls;
}
