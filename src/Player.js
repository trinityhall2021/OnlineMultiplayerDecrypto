import React, { Component } from 'react';
import './Player.css'

class Player extends Component {

    constructor(props){
        super(props);
        this.state = {
            name: props.name,
            team: props.team,

        }
    }

    render() {
        return (
            <div className="player">
                <p> Name: {this.state.name} </p>
                <p> Team: {this.state.team} </p>
            </div>
        )
    }
}


export default Player;