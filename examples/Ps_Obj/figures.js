import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const textureLoader = new THREE.TextureLoader()
let map =  textureLoader.load('Ps_Obj/static/textures/Checkerboard.png')
map.encoding = THREE.sRGBEncoding
map.flipY = false

export async function explode (object3d, scene) {
  console.log('EXPLODE!', object3d.children.length)

  // const promises = object3d.children.map(child => new Promise(function() {
  //   console.log('Extracting children')
  //   object3d.parent.attach(child)
  // }))

  // try {
  //   Promise.all(promises).then(() => {
  //     console.log('Extraction finished')
  //     scene.remove(object3d)
  //   })
  // } catch (e)  {
  //   console.error('Oops', e)
  // }

  for (const child of object3d.children) {
    new Promise(function(resolve) {
      object3d.parent.attach(child)
    }).then(() => {console.log('Extracting children')})
  }

 

}

export function getLoaderPromise (props, scene) {

  const onLoadFn = (gltf) => {

    const mesh = gltf.scene
    mesh.position.set(5,0, 5)
    scene.add(mesh);

   
    // const box = new THREE.Box3().setFromObject(mesh)
    // const boxHelper = new THREE.Box3Helper(box, color);
    // scene.add(boxHelper);
  }

  return new Promise(
      (resolve) => new GLTFLoader().load(props.filePath, (gltf) => resolve(onLoadFn(gltf)))
  );
}
