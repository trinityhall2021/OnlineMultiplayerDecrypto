import React, { Component } from "react";
import socket from "./Socket";

export const SUBMIT_GUESS = 0;
export const INTERCEPT = 1;
export const DISPLAY_CODE = 2;

class Submit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code_card: ['1', '2', '3']
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    let state = {};
    state[e.target.name] = e.target.value;
    console.log(state);
    this.setState(state);
  }
  render() {
    let title = "";
    let buttonFunction = null;
    if (this.props.type === SUBMIT_GUESS) {
      title = "Submit Guess";
      buttonFunction = submitGuess;
    }
    if (this.props.type === INTERCEPT) {
      title = "Intercept Guess";
      buttonFunction = interceptGuess;
    }
    return (
      <div>
        <h3>{title}</h3>
        <select
          value={this.state.code_card[0]}
          onChange={this.handleChange}
          name="code_1"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select
          value={this.state.code_card[1]}
          onChange={this.handleChange}
          name="code_2"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select
          value={this.state.code_card[2]}
          onChange={this.handleChange}
          name="code_3"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <button onClick={() => buttonFunction(this.state.code_card)}>Submit</button>
      </div>
    );
  }
}

function submitGuess(code) {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  const user = urlParams.get("name");
  socket.emit(
    "submit_guess",
    {
      'guess': code,
      'guess_type': 'normal',
      'room_id': roomId,
      'user': user,
    });
}

function interceptGuess(code) {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  const user = urlParams.get("name");
  socket.emit(
    "submit_guess",
    {
      'guess': code,
      'guess_type': 'intercept',
      'room_id': roomId,
      'user': user,
    });
}

socket.on("guess_submitted", (msg) => {
  console.log(msg);
  console.log("guess submitted!");
});

class DisplayCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codecard: "",
    };
    fetch("/requestClue")
      .then((resp) => resp.json())
      .then((data) => {
        let current_codecard = "";
        for (let i = 0; i < data.codecard.length; i++) {
          current_codecard += data.codecard[i];
          current_codecard += " ";
        }
        this.setState({ codecard: current_codecard });
      });
  }

  render() {
    return (
      <div>
        <h3>Display Code</h3>
        <div>
          <p>{this.state.codecard}</p>
        </div>
      </div>
    );
  }
}

export function GameState(props) {
  if (props.gameState === SUBMIT_GUESS) {
    return <Submit type={props.gameState} />;
  }
  if (props.gameState === INTERCEPT) {
    return <Submit type={props.gameState} />;
  }
  if (props.gameState === DISPLAY_CODE) {
    return <DisplayCode />;
  }
}
