import React, { Component } from "react";

export const SUBMIT_GUESS = 0;
export const INTERCEPT = 1;
export const DISPLAY_CODE = 2;


function SubmitGuess(props) {
  return (
    <div>
      <h3>Submit Guess</h3>
      <select name="code-1" id="code-1">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <select name="code-2" id="code-2">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <select name="code-1" id="code-1">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <button>Submit</button>
    </div>
  );
}

function Intercept(props) {
  return (
    <div>
      <h3>Intercept</h3>
    </div>
  );
}

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
    if (this.state.gamestate === SUBMIT_GUESS) {
      return <SubmitGuess />;
    } else if (this.state.gamestate === INTERCEPT) {
      return <Intercept />;
    } else if (this.state.gamestate === DISPLAY_CODE) {
      return <DisplayCode codecard={this.state.codecard} />;
    }
    return <SubmitGuess />;
  }
}
