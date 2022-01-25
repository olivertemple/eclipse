import * as React from "react"
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

function calculate_t(r){
  let G = 6.67408e-11;
  let M = 1.989e30;
  return (2*Math.PI*r*Math.sqrt(r))/(Math.sqrt(G*M));
}

function calculate_position(r){
  let T = calculate_t(r);
  let align = 16483651200;
  let now = + new Date();
  let change = (align - now)/1000;
  let proportion_of_orbit = T / change - Math.floor(T / change);

  let circumference = 2*Math.PI*r;
  let proportion_of_circumference = proportion_of_orbit * circumference;
  //console.log(proportion_of_circumference);
  let angle = proportion_of_circumference / r; //angle in radians
  console.log(angle*180/Math.PI);
  return angle;
}

function create_planet(radius, distance_from_sun, name){
  let geometry;
  if (name !== "Sun"){
    geometry = new THREE.SphereGeometry( radius/500000, 32, 16 );
  }else{
    geometry = new THREE.SphereGeometry( radius/15000000, 32, 16 );
  }

  let loader = new TextureLoader().load(`static/${name.toLocaleLowerCase()}.jpg`);
  const material = new THREE.MeshBasicMaterial( { map: loader } );

  const sphere = new THREE.Mesh( geometry, material );
  if (distance_from_sun > 0){
    let angle = calculate_position(distance_from_sun);
    let x = Math.cos(angle) * distance_from_sun;
    let y = Math.sin(angle) * distance_from_sun;

    sphere.translateX(x/1000000000);
    sphere.translateZ(y/1000000000);
  }
  return sphere;
}
const planets = [
    {name:"Sun", distance_from_sun:0, radius:696340e3},
    {name:"Mercury", distance_from_sun:57910000e3, radius:2439.7e3},
    {name:"Venus", distance_from_sun:108200000e3, radius:6051.8e3},
    {name:"Earth", distance_from_sun:147280000e3, radius:6371e3},
    {name:"Mars", distance_from_sun:226440000e3, radius:3389.5e3},
    {name:"Jupiter", distance_from_sun:746480000e3, radius:69911e3},
    {name:"Saturn", distance_from_sun:1480800000e3, radius:58232e3},
    {name:"Uranus", distance_from_sun:2949300000e3, radius:25362e3},
    {name:"Neptune", distance_from_sun:4495000000e3, radius:24622e3}
];
const IndexPage = () => {
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 260000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );
  renderer.setClearColor( 0xffffff, 0);

  planets.forEach(planet => {
    scene.add(create_planet(planet.radius, planet.distance_from_sun, planet.name));
  })


  /*
  let controls = new FlyControls( camera, renderer.domElement );
  controls.dragToLook = true;
  controls.movementSpeed = 10;
  controls.rollSpeed = 1;*/
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.5;

  camera.position.set( 0, 0, 500 );
  controls.update();

  var lt = new Date();
  var loop = function () {
      var now = new Date(),
      secs = (now - lt) / 1000;
      lt = now;
      requestAnimationFrame(loop);
      // UPDATE CONTROLS
      controls.update(1 * secs);
      renderer.render(scene, camera);
  };

  loop();
  /*
  function animate() {
    requestAnimationFrame( animate );


    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    renderer.render( scene, camera );
  }
  animate();*/

  return (
    <main>
      <title>eclipse</title>
      <div id="container"/>
    </main>
  )
}

export default IndexPage
