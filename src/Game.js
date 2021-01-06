import React, { Component } from 'react';
import './Game.css';
import { DISPLAY_CODE, SUBMIT_GUESS, INTERCEPT, GameState } from './GameState';
import Player from './Player';
import Team from './Team';
import WordCard from './WordCard'

class Game extends Component {

  constructor(props) {
      super(props);
      this.state = {
          game_state : INTERCEPT,
          red_team_players: ["User1", "User3"],
          blue_team_players: ["User2", "User4"]
      }
  }

  render() {

    return (
      <div className="Game">
        <h1>DECRYPTO</h1>
        <h2>USER INFO</h2>
        <Player name="User1" team="RED"/>

        <h2>WORDCARDS</h2>
        <div class="flex-container">
          <WordCard word="HELLO" />
          <WordCard word="WORLD" />
          <WordCard word="FLEX" />
          <WordCard word="X" />
        </div>

        <h2>ACTION</h2>
        <GameState gamestate={this.state.game_state} />

        <h2>TEAM INFORMATION</h2>
        <div class="flex-container">
            <Team 
                team_name="Red"
                team_players={this.state.red_team_players} 
                num_misses="0"
                num_intercepts="0"/>
            <Team
                team_name="Blue"
                team_players={this.state.blue_team_players}
                num_misses="1"
                num_intercepts="1" />
        </div>
      </div>
    );
  }
}

export default Game;