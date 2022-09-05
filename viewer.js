/**
 * @preserve
 * @file Script to add a GLB object viewer to Empretienda
 * @author Keyvin Duque <thkeyduq@gmail.com>
 * @license MIT
 * @copyright Keyvin Duque 2022
 * @endpreserve
 */
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const elements = document.getElementsByClassName("product-vip__description");
let count = 0;
let data;
for (const ele of elements) {
  const id = `souzo_viewer_${count}`;
  const json = ele.textContent.substring(ele.textContent.indexOf('{__preview__}') + 13, ele.textContent.indexOf('{__endpreview__}') - 1);
  data = JSON.parse(json);
  const regex = /<p>{__preview__}<\/p>(.|\s)*{__endpreview__}<\/p>/g;
  if (data.active === false) {
    ele.innerHTML = ele.innerHTML.replace(
      regex,
      ''
    );
  } else {
    ele.innerHTML = ele.innerHTML.replace(
      regex,
      `
      <button 
        class="button button--full background--primary background--primary-hover contrast_text--primary contrast_text--primary-hover uk-button uk-button-input border-radius" 
        id="${id}_btn_open" type="button" onclick="showViewer('${id}')">
        Ver modelo 3D
      </button>
      <div id="${id}_loading"></div>
      <div id="${id}"></div>
      `
    );
  }
  count++;
}

window.showViewer = function (elementId) {
  const container = document.getElementById(elementId);
  const loading = document.getElementById(`${elementId}_loading`);
  const btnOpen = document.getElementById(`${elementId}_btn_open`);
  const width = container.clientWidth;
  const height = Math.min(container.clientWidth, window.innerHeight);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1); //default; light shining from top
  light.castShadow = true; // default false
  light.shadow.camera.far = 1000;
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(30, width / height, 1, 1000);
  // camera.position.set(-160, 110, 90);
  // camera.position.set(0, 0, 0);

  //
  const loader = new GLTFLoader().setPath(
    "https://cdn.jsdelivr.net/gh/keyduq/souzo-viewer@master/samples/"
  );
  loader.load(
    data.filename ?? getSlug(),
    function (gltf) {

      const model = gltf.scene;

      model.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          const controls = new OrbitControls(camera, renderer.domElement);
          fitCameraToCenteredObject(camera, node, controls);
          controls.addEventListener("change", () => {
            onResize(renderer, scene, camera, width, height);
          });
        }
      });
      scene.add(model);

      render(renderer, scene, camera);
      btnOpen.style.display = "none";
      loading.innerHTML = "";
    },
    function (xhr) {
      btnOpen.style.display = "none";
      loading.innerHTML = "Loading...";
      console.log(xhr.loaded + " loaded.");
    },
    function (err) {
      btnOpen.style.display = "display";
      console.error(err);
    }
  );
};

window.closeViewer = function (elementId) {
  const container = document.etElementById(elementId);
  const btnOpen = document.getElementById(`${elementId}_btn_open`);
  const btnClose = document.getElementById(`${elementId}_btn_close`);
  container.innerHTML = "";
  btnOpen.style.display = "block";
  btnClose.style.display = "none";
};

function render(renderer, scene, camera) {
  renderer.render(scene, camera);
}

function onResize(renderer, scene, camera, width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  render(renderer, scene, camera);
}

function getSlug() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1);
}
("");

function fitCameraToCenteredObject(camera, object, controls) {
  const boundingBox = new THREE.Box3();

  boundingBox.setFromObject(object);

  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  console.log(maxSize);
  let newPositionCamera = new THREE.Vector3(maxSize, maxSize, maxSize);
  camera.zoom = 0.5;
  camera.left = -(2 * maxSize);
  camera.bottom = -(2 * maxSize);
  camera.top = 2 * maxSize;
  camera.right = 2 * maxSize;
  camera.near = 0.01;
  camera.far = maxSize * 1000;
  // camera;
  camera.position.set(
    newPositionCamera.x,
    newPositionCamera.y,
    newPositionCamera.z
  );
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  
  controls.target.set(center.x, center.y, center.z);
  controls.update();
}
