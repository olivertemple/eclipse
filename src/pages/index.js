import * as React from "react"
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import Helmet from "react-helmet";
import "./styles.scss";



class IndexPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time: + new Date(),//time of the simulation
      sun_scale:15000000,//scale of the size of the sun
      planet_scale:500000,//scale of the size of the planets
      distance_scale:1000000000,//scale of the distance of the planets
      paused:true,//whether the simulation is paused
      speed:36000000
    }

    this.speed = 36000000//speed of the simulation
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
    this.time = + new Date();//time of the simulation
    this.scene_container = React.createRef();//create a reference to the scene container
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

    if (distance_from_sun > 0){//set the initial distance of the planets
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
    let circumference = 2*Math.PI*r; // Circumference of the orbit
    let proportion_of_circumference = proportion_of_orbit * circumference; // Proportion of the circumference completed
    let angle = proportion_of_circumference / r; // Angle of the proportion of the circumference completed
    return angle; // Return the angle in radians
  }

  move_planets(){//rotate the planets around the sun
    setTimeout(() => {
      this.planets.forEach(planet => {
        if (planet.distance_from_sun > 0){
          let angle = this.calculate_position(planet.distance_from_sun);//calculate the angle of the planet from the sun
          let x = Math.cos(angle) * planet.distance_from_sun;//convert to cartesian coordinates
          let y = Math.sin(angle) * planet.distance_from_sun;//convert to cartesian coordinates
          planet.scene_item.position.set(x/this.state.distance_scale, 0, y/this.state.distance_scale);//set the position of the planet
        }
      })
      if (!this.state.paused){
        this.time = this.time + this.speed; //skip forward 10 hours
        this.setState({time:this.time});//update the time of the simulation
      }

      this.move_planets();//recursively call the function
    }, 10)//wait 10 milliseconds
  }
  componentDidMount(){
    this.create();
  }
  create(){
    this.scene_container.current.innerHTML = "";//clear the scene
    const scene = new THREE.Scene();//create the scene
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 260000 );//create the camera

    const renderer = new THREE.WebGLRenderer();//create the renderer
    renderer.setSize( window.innerWidth, window.innerHeight);//set the size of the renderer
    this.scene_container.current.appendChild( renderer.domElement );//append the renderer to the scene container
    renderer.shadowMap.enabled = true;//enable shadows

    this.planets.forEach(planet => {//create the planets
      let object = this.create_planet(planet.radius, planet.distance_from_sun, planet.name);//create planet
      planet.scene_item = object;//store the planet so the position can be changes later
      scene.add(object);//add the planet to the scene
      let width;//calculate the width of the orbital path
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
      let orbit = new THREE.RingGeometry( planet.distance_from_sun/this.state.distance_scale, planet.distance_from_sun/this.state.distance_scale + width, 256 );//create the orbital path
      let material = new THREE.MeshBasicMaterial( { color: "#707070", side: THREE.DoubleSide } );//create the material
      let ring = new THREE.Mesh( orbit, material );//create the ring
      ring.rotateX(Math.PI/2);//rotate the ring
      scene.add( ring );//add the ring to the scene
    
    })

    //create the light in the center of the sun
    const light = new THREE.PointLight( 0xffffff, 1, 100000000 );
    light.position.set( 0, 0, 0 );
    scene.add( light );

    //create the controls
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //set the controls to looking down on the solar system
    camera.position.set( 0, 500, 0 );
    controls.update();

    //loop function for the animation and updating controls
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

    window.addEventListener("keydown", event => {//allow for the camera to be moved with the arrow keys
      console.log(event)
      event.preventDefault();
      switch (event.key){
        case "ArrowLeft":
          camera.translateX(-10);
          break;
        case "ArrowRight":
          camera.translateX(10);
          break;
        case "ArrowUp":
          camera.translateY(10);
          break;
        case "ArrowDown":
          camera.translateY(-10);
          break;
        case "=":
          if (event.ctrlKey){
            camera.translateZ(-10);
          }
          break;
        case "-":
          if (event.ctrlKey){
            camera.translateZ(10);
          }
          break;
        case " ":
          this.setState({paused:!this.state.paused});
          break;
        case "r":
          this.setState({time:+ new Date()});
          this.time = + new Date(); 
          this.move_planets();
          break;
      }
    })
    loop();
    this.move_planets();//start the planets moving
  }

  convert_date(date){
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let today = `${date.toLocaleTimeString()}, ${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    return today
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
          <div className="info">
            <h1 style={{color:"white"}}>{this.convert_date(new Date(this.state.time))}</h1>
            <div className="slider">
              <label htmlFor="speed">Speed: {(this.state.speed/(10*60*60)).toFixed(2)}x</label>
              <input type="range" id="speed" min="0" max="36000000" defaultValue={this.speed} onChange={(e) => {this.speed = parseFloat(e.target.value); this.setState({speed:this.speed})}}/>
            </div>
            <button onClick={() => {this.setState({paused:!this.state.paused})}}>{this.state.paused ? "Play" : "Pause"} </button>
            <button onClick={() => {this.setState({time:+ new Date()}); this.time = + new Date(); this.move_planets();}}>Reset</button>
          </div>
          <div ref={this.scene_container}></div>
        </main>
      </main>
    )
  }
}

export default IndexPage
