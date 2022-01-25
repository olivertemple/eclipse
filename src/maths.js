function calculate_t(r){
    let G = 6.67408e-11;
    let M = 1.989e30;
    return (2*Math.PI*r*Math.sqrt(r))/(Math.sqrt(G*M));
}

function calculate_position(name, r){
    let T = calculate_t(r);

    let align = 16483651200000;
    let now = + new Date();
    let change = (align - now)/1000;
    let proportion_of_orbit = (T / change) - Math.floor(T / change);

    let circumference = 2*Math.PI*r;
    let proportion_of_circumference = proportion_of_orbit * circumference;
    let angle = proportion_of_circumference / r;
    let angle_in_deg = angle * 180 / Math.PI;
    console.log(name, ": ", angle_in_deg);

}

let positions = [
    {name:"Mercury", radius:57910000e3},
    {name:"Venus", radius:108200000e3},
    {name:"Earth", radius:147280000e3},
    {name:"Mars", radius:226440000e3},
    {name:"Jupiter", radius:74648000e3},
    {name:"Saturn", radius:1480800000e3},
    {name:"Uranus", radius:2949300000e3},
    {name:"Neptune", radius:4495000000e3}
];

positions.forEach(item => {
    calculate_position(item.name, item.radius);
})