
import * as THREE from "three";
// import * as dat from 'dat.gui'
import {initAmbientLight, initCamera, initControls, initDirectionalLight, initFloor, initRenderer} from "./initializers.js";
import {getLoaderPromise, explode} from "./figures.js";

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const btnExplode = document.getElementById('btn-explode')
const btnInfo = document.getElementById('btn-info')

/**
 * Base
 */
// Debug
const gui = new GUI()

//constants
const scaleSet = 0.30480000376701355
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const clock = new THREE.Clock()

const canvas = document.getElementById( 'container' );// Canvas
const scene = new THREE.Scene() // Scene
const rayCaster = new THREE.Raycaster()

//init scene
const floor = initFloor()
const ambientLight = initAmbientLight()
const directionalLight = initDirectionalLight()
const renderer = initRenderer(canvas, sizes);
const camera = initCamera(sizes);
const controls = initControls(camera, canvas);

scene.add(camera)
scene.add(floor)
scene.add(ambientLight)
scene.add(directionalLight)
// scene.add(camera)

btnExplode.onclick = () => {
  const ind = scene.children.length - 1
  explode(scene.children[ind], scene)
}

btnInfo.onclick = () => {
  console.log(scene)
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// animate
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

const props0 = {

  filePath: 'Ps_Obj/static/models/Obj1/glTF/Object_One.gltf',

  ports:
      {
        x: 1,
        y: 1,
        z: 1
      }

}
const props1 = {

  filePath: 'Ps_Obj/static/models/Light/glTF/СОВ.ТМ. Цвет.gltf',

  ports:
      {
        x: 1,
        y: 1,
        z: 1
      }

}



// promises and custom logic
Promise.all([
  getLoaderPromise(props1, scene),
]).then(values => {
  

}

)

// function drawSegmentedLine(values) {
//   // console.log(values)
//   const mX = (values[0].getCenter(new THREE.Vector3()).x - values[1].getCenter(new THREE.Vector3()).x) * 0.5
//   const aCoordinates = {
//     x: mX,
//     y: values[1].getCenter(new THREE.Vector3()).y,
//     z: values[1].getCenter(new THREE.Vector3()).z
//   }
//   const bCoordinates = {
//     x: mX,
//     y: values[1].getCenter(new THREE.Vector3()).y,
//     z: values[0].getCenter(new THREE.Vector3()).z
//   }
//   const cCoordinates = {
//     x: mX,
//     y: values[0].getCenter(new THREE.Vector3()).y,
//     z: values[0].getCenter(new THREE.Vector3()).z
//   }

//   const lineMaterial = new THREE.LineBasicMaterial({color: 0xfaf211});
//   drawLine(values[1].getCenter(new THREE.Vector3()), aCoordinates, lineMaterial)
//   drawLine(aCoordinates, bCoordinates, lineMaterial)
//   drawLine(bCoordinates, cCoordinates, lineMaterial)
//   drawLine(cCoordinates, values[0].getCenter(new THREE.Vector3()), lineMaterial)
// }

// const drawLine = (coord1, coord2, material) => {
//   const lineGeometry4 = new THREE.Geometry()
//   lineGeometry4.vertices.push(coord1);
//   lineGeometry4.vertices.push(coord2);
//   const newLine4 = new THREE.Line(lineGeometry4, material)
//   scene.add(newLine4)
// }
tick()
