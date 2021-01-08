import React, { Component } from "react";
import "./Game.css";
import { DISPLAY_CODE, SUBMIT_GUESS, INTERCEPT, GameState } from "./GameState";
import Player from "./Player";
import Team from "./Team";
import WordCard from "./WordCard";
import socket from './Socket'


class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: SUBMIT_GUESS,
      codecard: ["0", "0", "0"],
      red_team: {players: []},
      blue_team: {players: []},
    };
    console.log(socket)
    console.log(socket.io.opts.query)
    fetch('/state?room_id=main')
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data)
        this.setState(data);
      });
  }
  componentDidMount() {
    socket.on('player_added', (msg) => {
      this.setState(msg)
    });
  }
  render() {
    console.log(this.state.gameState)
    return (
      <div className="Game">
        <h1>DECRYPTO</h1>
        <h2>USER INFO</h2>
        <Player name="User1" team="RED" />
        <button onClick={()=>this.setState({gameState:SUBMIT_GUESS})}>SUBMIT_GUESS</button>
        <button onClick={()=>this.setState({gameState:INTERCEPT})}>INTERCEPT</button>
        <button onClick={()=>this.setState({gameState:DISPLAY_CODE})}>DISPLAY_CODE</button>
        <h2>WORDCARDS</h2>
        <div className="flex-container">
          <div className="flex-container column">
            <WordCard word="1" />
            <WordCard word="HELLO" />
          </div>
          <div className="flex-container column">
            <WordCard word="2" />
            <WordCard word="WORLD" />
          </div>
          <div className="flex-container column">
            <WordCard word="3" />
            <WordCard word="WEIRD" />
          </div>
          <div className="flex-container column">
            <WordCard word="4" />
            <WordCard word="FLEX" />
          </div>
        </div>

        <h2>ACTION</h2>
        <GameState
          gameState={this.state.gameState}
          codecard={this.state.codecard}
        />

        <h2>TEAM INFORMATION</h2>
        <div className="flex-container">
          <Team
            team_name="Red"
            team_players={this.state.red_team.players}
            num_misses={this.state.red_team.misses}
            num_intercepts={this.state.red_team.intercepts}
          />
          <Team
            team_name="Blue"
            team_players={this.state.blue_team.players}
            num_misses={this.state.blue_team.misses}
            num_intercepts={this.state.blue_team.intercepts}
          />
        </div>
      </div>
    );
  }
}

export default Game;

