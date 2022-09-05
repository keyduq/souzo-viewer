import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const elements = document.getElementsByClassName("product-vip__description");
let element = Array.from(elements).find(e => e.offsetParent != null)

element.innerHTML = element.innerHTML.replace(
  "<p>{__preview__}</p>",
  '<div id="souzo_viewer"></div>'
);
const container = document.getElementById("souzo_viewer");
const width = element.clientWidth;
const height = Math.min(element.clientWidth, window.innerHeight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2e6fc);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

const camera = new THREE.PerspectiveCamera(
  30,
  width / height,
  1,
  2000
);
camera.position.set(-160, 110, 90);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", render); // use if there is no animation loop
controls.target.set(0, 30, 0);
controls.update();
//
const loader = new GLTFLoader().setPath("https://cdn.jsdelivr.net/gh/keyduq/souzo-viewer@master/samples/");
loader.load(
  "creeper_preview.glb",
  function (gltf) {
    // gltf.scene.position.z = 10;
    scene.add(gltf.scene);
    render();
  },
  undefined,
  function (err) {
    console.error(err);
  }
);

window.addEventListener('resize', function () {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  render();
});

function render() {
  console.log(camera.position);
  renderer.render(scene, camera);
}
