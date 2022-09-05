import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const elements = document.getElementsByClassName("product-vip__description");
let element = Array.from(elements).find((e) => e.offsetParent != null);
let count = 0;
for (const ele of elements) {
  const id = `souzo_viewer_${count}`;
  ele.innerHTML = ele.innerHTML.replace(
    '<p>{__preview__}</p>',
    `
    <button id="${id}_btn_open" type="button" onclick="showViewer('${id}')">Ver modelo 3D</button>
    <div id="${id}"></div>
    <button style="display: none;" id="${id}_btn_close" type="button" onclick="closeViewer('${id}')">Cerrar modelo</button>
    `
  );
  count++;
}

window.showViewer = function(elementId) {
  const container = document.getElementById(elementId);
  const btnOpen = document.getElementById(`${elementId}_btn_open`)
  const btnClose = document.getElementById(`${elementId}_btn_close`)
  const width = element.clientWidth;
  const height = Math.min(element.clientWidth, window.innerHeight);

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

  const camera = new THREE.PerspectiveCamera(30, width / height, 1, 2000);
  camera.position.set(-160, 110, 90);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => {
    onResize(renderer, scene, camera, width, height);
  }); // use if there is no animation loop
  controls.target.set(0, 30, 0);
  controls.update();
  //
  const loader = new GLTFLoader().setPath(
    "https://cdn.jsdelivr.net/gh/keyduq/souzo-viewer@master/samples/"
  );
  loader.load(
    `${getSlug()}_preview.glb`,
    function (gltf) {
      // gltf.scene.position.z = 10;

      // const planeGeometry = new THREE.PlaneGeometry(500, 500, 8, 8);
      // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      // plane.receiveShadow = true;
      // plane.rotateX(- Math.PI / 2)
      // scene.add(plane);

      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      scene.add(gltf.scene);

      render(renderer, scene, camera);
      btnOpen.style.display = "none";
      btnClose.style.display = "block";
    },
    undefined,
    function (err) {
      console.error(err);
    }
  );
}

window.closeViewer = function(elementId) {
  const container = document.getElementById(elementId);
  const btnOpen = document.getElementById(`${elementId}_btn_open`)
  const btnClose = document.getElementById(`${elementId}_btn_close`)
  container.innerHTML = '';
  btnOpen.style.display = 'block';
  btnClose.style.display = 'none';
}

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
  return path.substring(path.lastIndexOf('/') + 1);
}
