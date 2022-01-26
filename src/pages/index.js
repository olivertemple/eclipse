import * as React from "react"
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import Helmet from "react-helmet";
import Switch from "@mui/material/Switch";
import "./styles.scss";
import Clock from "./components/Clock";
import icon from "../../public/static/icon.png";
class IndexPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time: + new Date(),//time of the simulation
      sun_scale:15000000,//scale of the size of the sun
      planet_scale:500000,//scale of the size of the planets
      distance_scale:1000000000,//scale of the distance of the planets
      paused:true,//whether the simulation is paused
      speed:36000000,
      time_forward:true,
      popup:true,
    }

    this.planets = [
      {name:"Sun", distance_from_sun:0, radius:696340e3, scene_item:null},
      {name:"Mercury", distance_from_sun:57910000e3, radius:2439.7e3, scene_item:null},
      {name:"Venus", distance_from_sun:108200000e3, radius:6051.8e3, scene_item:null},
      {name:"Earth", distance_from_sun:147280000e3, radius:6371e3, scene_item:null, moons:[{name:"Moon", T:2419200, scene_item:null}]},
      {name:"Mars", distance_from_sun:226440000e3, radius:3389.5e3, scene_item:null},
      {name:"Jupiter", distance_from_sun:746480000e3, radius:69911e3, scene_item:null},
      {name:"Saturn", distance_from_sun:1480800000e3, radius:58232e3, scene_item:null},
      {name:"Uranus", distance_from_sun:2949300000e3, radius:25362e3, scene_item:null},
      {name:"Neptune", distance_from_sun:4495000000e3, radius:24622e3, scene_item:null}
    ];

    this.scene_container = React.createRef();//create a reference to the scene container
    this.camera = null;//the camera

    this.reset = this.reset.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.switchTime = this.switchTime.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
  }

  calculate_position(r){//calculate the position of the planet
    const G = 6.67408e-11; //universal gravitational constant
    const M = 1.989e30; //mass of the sun
    let T = (2*Math.PI*r*Math.sqrt(r))/(Math.sqrt(G*M)); //Time period for planet to orbit the sun
    let align = 16483651200; // Date of the alignment of the orbits
    let change = (align - this.state.time)/1000; // Time difference between now and the alignment of the orbits
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
        if (this.state.time_forward){
          this.setState({time:this.state.time + this.state.speed});//skip forward
        }else{
          this.setState({time:this.state.time - this.state.speed});//skip backward
        }
      }

      this.move_planets();//recursively call the function
    }, 1)//wait 1 millisecond
  }

  componentDidMount(){
    const { scene, camera, renderer, controls } = this.init_scene();//initialize the scene

    this.create_planets(scene);

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
          event.preventDefault();
          if (event.ctrlKey){
            camera.translateZ(-10);
          }
          break;
        case "-":
          event.preventDefault();
          if (event.ctrlKey){
            camera.translateZ(10);
          }
          break;
        case " ":
          this.setState({paused:!this.state.paused});
          break;
        case "r":
          if (!event.ctrlKey){
            this.setState({time:+ new Date()});
            this.move_planets();
            break;
          }
      }
    })
    loop();
    //window.addEventListener('click', (e) => {this.onDocumentMouseDown(e, renderer, camera, scene)}, false);

    this.move_planets();//start the planets moving
  }

  init_scene() {
    this.scene_container.current.innerHTML = ""; //clear the scene
    const scene = new THREE.Scene(); //create the scene
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 260000); //create the camera
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer(); //create the renderer
    renderer.setSize(window.innerWidth, window.innerHeight); //set the size of the renderer
    this.scene_container.current.appendChild(renderer.domElement); //append the renderer to the scene container
    renderer.shadowMap.enabled = true; //enable shadows



    //create the light in the center of the sun
    const light = new THREE.PointLight( 0xffffff, 1, 100000000 );
    light.position.set( 0, 0, 0 );
    scene.add( light );

    //create the controls
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //set the controls to looking down on the solar system
    camera.position.set( 0, 500, 0 );
    controls.update();

    return { scene, camera, renderer, controls };
  }

  create_planets(scene) {
    this.planets.forEach(planet => {
      let object = this.create_planet(planet.radius, planet.distance_from_sun, planet.name); //create planet
      planet.scene_item = object; //store the planet so the position can be changes later
      scene.add(object); //add the planet to the scene

      let width; //calculate the width of the orbital path
      switch (planet.name) {
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

      let ring = this.create_orbit_path(planet, width); //Create the orbital path
      scene.add(ring);
    });
  }

  create_planet(radius, distance_from_sun, name){//create a three.js sphere to represent the planet
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
    sphere.name = name;

    if (distance_from_sun > 0){//set the initial distance of the planets
      let angle = this.calculate_position(distance_from_sun);
      let x = Math.cos(angle) * distance_from_sun;
      let y = Math.sin(angle) * distance_from_sun;
      sphere.position.set(x/this.state.distance_scale, 0, y/this.state.distance_scale);
    }

    
    return sphere;
  }

  create_orbit_path(planet, width) {
    let orbit = new THREE.RingGeometry(
      planet.distance_from_sun / this.state.distance_scale - width/2,
      planet.distance_from_sun / this.state.distance_scale + width/2,
      256 //the number of segments to make up the circle
    ); //create the orbital path

    let material = new THREE.MeshBasicMaterial({ color: "#707070", side: THREE.DoubleSide }); //create the material
    let ring = new THREE.Mesh(orbit, material); //create the ring
    ring.rotateX(Math.PI / 2); //rotate the ring
    return ring;
  }

  convert_date(date){
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let today = `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    return today
  }

  togglePause(){
    this.setState({paused:!this.state.paused})
  }

  reset(){
    this.setState({time:+ new Date()});
    this.move_planets();
    this.camera.position.set( 0, 500, 0 );
    this.camera.lookAt(0,0,0);
  }

  switchTime(){
    this.setState({time_forward:!this.state.time_forward});
  }

  togglePopup(){
    this.setState({popup:!this.state.popup});
  }

  render() { 
    return (
      <main>
        <Helmet>
          <title>eclipse</title>
          <meta name="description" content="eclipse" />
          <link rel="icon" href="static/icon.png" />
        </Helmet>
        <div className="info">
          <Clock time={this.state.time} />
          <h1 style={{color:"white"}}>{this.convert_date(new Date(this.state.time))}</h1>
          <div className="slider">
            <label htmlFor="speed">Speed</label>
            <input type="range" id="speed" min="10" max="36000000" defaultValue={this.state.speed} onChange={(e) => {this.setState({speed:parseFloat(e.target.value)})}}/>
          </div>
          <button onClick={this.togglePause}>{this.state.paused ? "Play" : "Pause"} </button>
          <button onClick={this.reset}>Reset</button>
          <div className="switch">
            <Switch className="time_forward" checked={this.state.time_forward} onChange={this.switchTime} inputProps={{ 'aria-label': 'controlled' }}/>
            <label htmlFor="time_forward">Time Forward</label>
          </div>
        </div>
        {this.state.popup ? (
          <div className="popup">
            <div className="popup_title">
              <img id="icon" src={icon} />
              <h1>Welcome to Eclipse!</h1>
            </div>
            <div className="popup_content">
              <p>Eclipse is a 3D model of the solar system, using A level physics to calculate the rough position of the planets.</p>
              <p>Use the mouse, or the arrow keys and +/- symbols to move around and zoom in and out.</p>
              <p>Please note: for an optimal experience, please use a device with a large screen.</p>
            </div>
            <button onClick={this.togglePopup}>Close</button>
          </div>
        ) : null}
        
        <div ref={this.scene_container}></div>
      </main>
    )
  }
}

export default IndexPage
