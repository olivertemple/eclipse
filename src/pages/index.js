import * as React from "react"
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import Helmet from "react-helmet";




class IndexPage extends React.Component{
  constructor(props){
    super(props);
    this.planets = [
      {name:"Sun", distance_from_sun:0, radius:696340e3, scene_item:null},
      {name:"Mercury", distance_from_sun:57910000e3, radius:2439.7e3, scene_item:null},
      {name:"Venus", distance_from_sun:108200000e3, radius:6051.8e3, scene_item:null},
      {name:"Earth", distance_from_sun:147280000e3, radius:6371e3, scene_item:null},
      {name:"Mars", distance_from_sun:226440000e3, radius:3389.5e3, scene_item:null},
      {name:"Jupiter", distance_from_sun:746480000e3, radius:69911e3, scene_item:null},
      {name:"Saturn", distance_from_sun:1480800000e3, radius:58232e3, scene_item:null},
      {name:"Uranus", distance_from_sun:2949300000e3, radius:25362e3, scene_item:null},
      {name:"Neptune", distance_from_sun:4495000000e3, radius:24622e3, scene_item:null}
    ];
    this.time = + new Date();
    this.scene_container = React.createRef();
  }

  create_planet(radius, distance_from_sun, name){//create a threejs sphere to represent the planet
    let geometry;
    let material;
    let loader = new TextureLoader().load(`static/${name.toLocaleLowerCase()}.jpg`);

    if (name !== "Sun"){
      geometry = new THREE.SphereGeometry( radius/500000, 32, 16 );
      material = new THREE.MeshPhysicalMaterial( { map: loader } );

    }else{
      geometry = new THREE.SphereGeometry( radius/15000000, 32, 16 );
      material = new THREE.MeshBasicMaterial( { map: loader } );
    }

    const sphere = new THREE.Mesh( geometry, material );

    if (distance_from_sun > 0){
      let angle = this.calculate_position(distance_from_sun);
      let x = Math.cos(angle) * distance_from_sun;
      let y = Math.sin(angle) * distance_from_sun;
      sphere.position.set(x/1000000000, 0, y/1000000000);
    }
    
    return sphere;
  }

  calculate_position(r){//calculate the position of the planet
    const G = 6.67408e-11; //universal gravitational constant
    const M = 1.989e30; //mass of the sun
    let T = (2*Math.PI*r*Math.sqrt(r))/(Math.sqrt(G*M)); //Time period for planet to orbit the sun
    let align = 16483651200; // Date of the alignment of the orbits
    let change = (align - this.time)/1000; // Time difference between now and the alignment of the orbits
    let proportion_of_orbit = T / change - Math.floor(T / change); // Proportion of the orbit completed
  
    let circumference = 2*Math.PI*r; // Circumference of the orbit
    let proportion_of_circumference = proportion_of_orbit * circumference; // Proportion of the circumference completed
    let angle = proportion_of_circumference / r; // Angle of the proportion of the circumference completed
    return angle; // Return the angle in radians
  }

  move_planets(){
    setTimeout(() => {
      this.planets.forEach(planet => {
        if (planet.distance_from_sun > 0){
          let angle = this.calculate_position(planet.distance_from_sun);
          let x = Math.cos(angle) * planet.distance_from_sun;
          let y = Math.sin(angle) * planet.distance_from_sun;
          planet.scene_item.position.set(x/1000000000, 0, y/1000000000);
        }
      })
      this.time = this.time + 86400000
      this.move_planets();
    }, 1)
    

  }

  componentDidMount(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 260000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    this.scene_container.current.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

    this.planets.forEach(planet => {
      let object = this.create_planet(planet.radius, planet.distance_from_sun, planet.name);
      planet.scene_item = object;
      scene.add(object);

      if (planet.name === "Saturn"){
          const geometry = new THREE.RingGeometry( 66900e3/500000, 74658e3/500000, 32 );
          const loader = new TextureLoader().load(`static/saturn_rings.png`);
          const material = new THREE.MeshBasicMaterial( { map: loader } );
          const ring = new THREE.Mesh( geometry, material );
          ring.rotateOnAxis(Math.PI/2);
          let pos = this.calculate_position(1480800000e3);
          ring.position.set(Math.cos(pos) * 1480800000e3/1000000000, 0, Math.sin(pos) * 1480800000e3/1000000000);
          scene.add(ring);
        }
    })

    const light = new THREE.PointLight( 0xffffff, 1, 100000000 );
    light.position.set( 0, 0, 0 );
    scene.add( light );

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
    this.move_planets();
  }
  render() { 
    return (
      <main>
        <Helmet>
          <title>eclipse</title>
          <meta name="description" content="eclipse" />
          <link rel="icon" href="static/icon.png" />
        </Helmet>
        <main>
          <div ref={this.scene_container}></div>
        </main>
      </main>
    )
  }
}

export default IndexPage
