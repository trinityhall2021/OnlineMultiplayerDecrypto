import React, { Component } from 'react';

class Team extends Component {

    constructor(props){
        super(props);
        this.state = {
            team_name : props.team_name,
            team_players: props.team_players,
            num_misses: props.num_misses,
            num_intercepts: props.num_intercepts

        }
    }

    render() {

        const team_players = [];

        for (let i = 0; i < this.state.team_players.length; i++) {
            team_players.push(<p>{this.state.team_players[i]}</p>)
        }
        return (
            <div>
                <p> {this.state.team_name} Team </p>
                {team_players}
                <p># misses: {this.state.num_misses}</p>
                <p># intercepts: {this.state.num_intercepts}</p>
            </div>
        )
    }
}


export default Team;