import React, { Component } from "react";
import "./Game.css";
import { DISPLAY_CODE, SUBMIT_GUESS, INTERCEPT, GameState } from "./GameState";
import Player from "./Player";
import Team from "./Team";
import WordCard from "./WordCard";

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game_state: SUBMIT_GUESS,
      codecard: ["1", "2", "3"],
      red_team_players: ["User1"],
      blue_team_players: ["User2"],
    };
    fetch("/user")
      .then((resp) => resp.json())
      .then((data) => {
        let new_players = this.state.red_team_players.slice();
        new_players.push(data);
        this.setState({ red_team_players: new_players });
      });
  }

  render() {
    return (
      <div className="Game">
        <h1>DECRYPTO</h1>
        <h2>USER INFO</h2>
        <Player name="User1" team="RED" />
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
          gamestate={this.state.game_state}
          codecard={this.state.codecard}
        />

        <h2>TEAM INFORMATION</h2>
        <div className="flex-container">
          <Team
            team_name="Red"
            team_players={this.state.red_team_players}
            num_misses="0"
            num_intercepts="0"
          />
          <Team
            team_name="Blue"
            team_players={this.state.blue_team_players}
            num_misses="1"
            num_intercepts="1"
          />
        </div>
      </div>
    );
  }
}

export default Game;
