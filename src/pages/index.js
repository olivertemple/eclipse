import * as React from "react"
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import Helmet from "react-helmet";




class IndexPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time: + new Date(),
      sun_scale:15000000,
      planet_scale:500000,
      distance_scale:1000000000,
      speed:36000000
    }
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

    if (name !== "Sun"){//create planets
      geometry = new THREE.SphereGeometry( radius/this.state.planet_scale, 32, 16 );
      material = new THREE.MeshPhysicalMaterial( { map: loader } );
    }else{//creat the sun
      geometry = new THREE.SphereGeometry( radius/this.state.sun_scale, 32, 16 );
      material = new THREE.MeshBasicMaterial( { map: loader } );
    }

    const sphere = new THREE.Mesh( geometry, material );

    if (distance_from_sun > 0){
      let angle = this.calculate_position(distance_from_sun);
      let x = Math.cos(angle) * distance_from_sun;
      let y = Math.sin(angle) * distance_from_sun;
      sphere.position.set(x/this.state.distance_scale, 0, y/this.state.distance_scale);
    }
    
    return sphere;
  }

  calculate_position(r){//calculate the position of the planet
    const G = 6.67408e-11; //universal gravitational constant
    const M = 1.989e30; //mass of the sun
    let T = (2*Math.PI*r*Math.sqrt(r))/(Math.sqrt(G*M)); //Time period for planet to orbit the sun
    let align = 16483651200; // Date of the alignment of the orbits
    let change = (align - this.time)/1000; // Time difference between now and the alignment of the orbits
    let proportion_of_orbit = (change / T - Math.floor(change / T)); // Proportion of the orbit completed
    console.log(proportion_of_orbit);
    let circumference = 2*Math.PI*r; // Circumference of the orbit
    let proportion_of_circumference = proportion_of_orbit * circumference; // Proportion of the circumference completed
    let angle = proportion_of_circumference / r; // Angle of the proportion of the circumference completed
    return angle; // Return the angle in radians
  }

  move_planets(){
    console.log("----")
    setTimeout(() => {
      this.planets.forEach(planet => {
        if (planet.distance_from_sun > 0){
          let angle = this.calculate_position(planet.distance_from_sun);
          let x = Math.cos(angle) * planet.distance_from_sun;
          let y = Math.sin(angle) * planet.distance_from_sun;
          planet.scene_item.position.set(x/this.state.distance_scale, 0, y/this.state.distance_scale);
        }
      })
      this.time = this.time + this.state.speed; //skip forward 10 hours
      this.setState({time:this.time});
      this.move_planets();
    }, 10)//wait 10 milliseconds
    

  }

  componentDidMount(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 260000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    this.scene_container.current.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

    let index = 0;
    this.planets.forEach(planet => {
      let object = this.create_planet(planet.radius, planet.distance_from_sun, planet.name);
      planet.scene_item = object;
      scene.add(object);
      let width;
      switch(planet.name){
        case "Mercury":
          width = 1;
          break;
        case "Venus":
          width = 1;
          break;
        case "Earth":
          width = 1;
          break;
        case "Mars":
          width = 2;
          break;
        case "Jupiter":
          width = 3;
          break;
        case "Saturn":
          width = 5;
          break;
        case "Uranus":
          width = 6;
          break;
        case "Neptune":
          width = 7;
          break;
        default:
          width = 8;
          break;
      }
      let orbit = new THREE.RingGeometry( planet.distance_from_sun/this.state.distance_scale, planet.distance_from_sun/this.state.distance_scale + width, 256 );
      let material = new THREE.MeshBasicMaterial( { color: "#707070", side: THREE.DoubleSide } );
      let ring = new THREE.Mesh( orbit, material );
      ring.rotateX(Math.PI/2);
      scene.add( ring );
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
          <h1 style={{color:"white", position:"absolute"}}>{new Date(this.state.time).toUTCString()}</h1>
          <div ref={this.scene_container}></div>
        </main>
      </main>
    )
  }
}

export default IndexPage
