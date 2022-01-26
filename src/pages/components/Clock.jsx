import React from "react";
import "./Clock.scss";
export default class Clock extends React.Component{
    render(){

        let time = new Date(this.props.time).toLocaleTimeString();
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];
        let seconds = time.split(":")[2];
        console.log(time)
        console.log(hours)

        let size = 200;
        let clock_number_styles = [];
        for(let i = 1; i < 13; i++){
            let angle = (i/12) * 360;
            let x = Math.cos(angle * (Math.PI / 180)) * (size/2);
            let y = Math.sin(angle * (Math.PI / 180)) * (size/2);
            clock_number_styles.push({
                transform: `translate(${x}px, ${y}px) rotate(90deg)`
            })
        }
        return(
            <div className="Clock">
                <div className="Clock_numbers">
                    {clock_number_styles.map((style, i) => {
                        return(
                            <div key={i} className="Clock_number" style={style}>
                                {i+1}
                            </div>
                        )
                    })}
                </div>
                <div className="hour_hand" style={{transform:`rotate(${hours * 30 + minutes / 2}deg)`}}></div>     
                <div className="min_hand" style={{transform:`rotate(${minutes * 6 + seconds / 10}deg)`}}></div>       
                <div className="second_hand" style={{transform:`rotate(${seconds * 6}deg)`}}></div>
                <div className="center"></div>  
            </div>
        )
    }
}