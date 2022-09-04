const threeVersion = "0.144.0";
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const element = document.getElementsByClassName("product-vip__description")[0];
element.innerHTML = element.innerHTML.replace(
  "<p>{__preview__}</p>",
  '<div id="souzo_viewer"></div>'
);
const container = document.getElementById("souzo_viewer");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

const grid = new THREE.GridHelper(1000, 20, 0x919191, 0x919191);
grid.material.opacity = 0.5;
grid.material.depthWrite = false;
grid.material.transparent = true;
scene.add(grid);

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.set(50, 200, 100);
// camera.rotation.x = Math.PI * 0.4;
// camera.rotation.y = Math.PI * 0.79;
// camera.rotation.z = Math.PI * 0.84;
// camera.rotation.set(-1, -0.79, -0.84);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", render); // use if there is no animation loop
controls.target.set(10, 20, -16);
controls.update();
//
const loader = new GLTFLoader().setPath("https://cdn.jsdelivr.net/gh/keyduq/souzo-viewer@master/samples/");
loader.load(
  "creeper_preview.glb",
  function (gltf) {
    // gltf.scene.rotation.y = 8;
    scene.add(gltf.scene);
    render();
  },
  function (xhr) {
    // loading
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (err) {
    console.error(err);
  }
);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

// window.onresize = function () {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
//   render();
// };

function render() {
  renderer.render(scene, camera);
}
