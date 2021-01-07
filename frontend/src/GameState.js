import React, { Component } from "react";
import socketIOClient from "socket.io-client";

export const SUBMIT_GUESS = 0;
export const INTERCEPT = 1;
export const DISPLAY_CODE = 2;

const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(ENDPOINT);

class Submit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code_1: "1",
      code_2: "2",
      code_3: "3",
      type: props.type,
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
    if (this.state.type == SUBMIT_GUESS) {
      title = "Submit Guess";
      buttonFunction = submitGuess;
    }
    if (this.state.type == INTERCEPT) {
      title = "Intercept Guess";
      buttonFunction = interceptGuess;
    }
    return (
      <div>
        <h3>{title}</h3>
        <select
          value={this.state.code_1}
          onChange={this.handleChange}
          name="code_1"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select
          value={this.state.code_2}
          onChange={this.handleChange}
          name="code_2"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select
          value={this.state.code_3}
          onChange={this.handleChange}
          name="code_3"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <button onClick={() => buttonFunction(this.state)}>Submit</button>
      </div>
    );
  }
}

function submitGuess(code) {
  socket.emit("submit_guess", code);
}

function interceptGuess(code) {
  socket.emit("intercept_guess", code);
}

socket.on("guess_submitted", (msg) => {
  console.log(msg);
  console.log("guess submitted!");
});

class DisplayCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codecard: props.codecard,
    };
  }

  render() {
    let codecard = "";

    for (let i = 0; i < this.state.codecard.length; i++) {
      codecard += this.state.codecard[i];
      codecard += " ";
    }

    return (
      <div>
        <h3>Display Code</h3>
        <div>
          <p>{codecard}</p>
        </div>
      </div>
    );
  }
}

export class GameState extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gamestate: props.gamestate,
      codecard: props.codecard,
    };
  }

  render() {
    if (
      this.state.gamestate === SUBMIT_GUESS ||
      this.state.gamestate === INTERCEPT
    ) {
      return <Submit type={this.state.gamestate} />;
    } else if (this.state.gamestate === DISPLAY_CODE) {
      return <DisplayCode codecard={this.state.codecard} />;
    }
    return <Submit />;
  }
}
