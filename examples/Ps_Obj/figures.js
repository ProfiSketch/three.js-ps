import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const textureLoader = new THREE.TextureLoader()
let map =  textureLoader.load('Ps_Obj/static/textures/Checkerboard.png')
map.encoding = THREE.sRGBEncoding
map.flipY = false

export function getLoaderPromise (props, scene) {

  const onLoadFn = (gltf) => {

    let mesh

    for (let i = 0; i<gltf.scene.children.length; i++) {

      const p1 = new Promise (function(resolve,reject) {
        mesh = gltf.scene.children[i],
        mesh.material.roughness = 0.7
        mesh.material.metalness = 0.9
        resolve(mesh)
      })

      p1.then(data => {
        scene.add(data);
      })
    }

    // mesh = gltf.scene
    // scene.add(mesh);

    // const box = new THREE.Box3().setFromObject(mesh)
    // const boxHelper = new THREE.Box3Helper(box, color);
    // scene.add(boxHelper);
  }

  return new Promise(
      (resolve) => new GLTFLoader().load(props.filePath, (gltf) => resolve(onLoadFn(gltf)))
  );
}
