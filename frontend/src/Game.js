import React, { Component } from "react";
import "./Game.css";
import { DISPLAY_CODE, SUBMIT_GUESS, INTERCEPT, GameState } from "./GameState";
import Player from "./Player";
import Team from "./Team";
import WordCardList from "./WordCardList";
import socket from "./Socket";

class Game extends Component {
  constructor(props) {
    super(props);
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get("name");
    this.state = {
      userName: userName,
      gameState: SUBMIT_GUESS,
      codecard: ["0", "0", "0"],
      red_team: { players: [], words: [] },
      blue_team: { players: [], words: [] },
    };
    console.log(socket);
    console.log(socket.io.opts.query);
    // TODO: Sanitize inputs
    fetch(`/state?room_id=main&user=${userName}`)
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        this.setState(data);
      });
  }
  componentDidMount() {
    socket.on("player_added", (msg) => {
      this.setState(msg);
    });
  }
  render() {
    console.log(this.state.gameState);
    let word_list = [];
    if (this.state.team === "red") {
      word_list = this.state.red_team.words;
    } else if (this.state.team === "blue") {
      word_list = this.state.blue_team.words;
    } else {
      word_list = [];
    }

    return (
      <div className="Game">
        <h1>DECRYPTO</h1>
        <h2>USER INFO</h2>
        <Player name={this.state.userName} team={this.state.team} />
        <button onClick={() => this.setState({ gameState: SUBMIT_GUESS })}>
          SUBMIT_GUESS
        </button>
        <button onClick={() => this.setState({ gameState: INTERCEPT })}>
          INTERCEPT
        </button>
        <button onClick={() => this.setState({ gameState: DISPLAY_CODE })}>
          DISPLAY_CODE
        </button>
        <h2>WORDCARDS</h2>
        <WordCardList word_list={word_list} />
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
