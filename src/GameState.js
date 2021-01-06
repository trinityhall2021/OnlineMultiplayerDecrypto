import React, { Component } from 'react';

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
  )
}

function Intercept(props) {
  return (
    <div>
      <h3>Intercept</h3>
    </div>
  )
}

function DisplayCode(props) {
  return (
    <div>
      <h3>DisplayCode</h3>
    </div>
  )
}

export class GameState extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      gamestate: props.gamestate
    }
  }
  
  render() {
    if (this.state.gamestate === SUBMIT_GUESS) {
      return <SubmitGuess />;
    } else if (this.state.gamestate === INTERCEPT) {
      return <Intercept />;
    } else if (this.state.gamestate === DISPLAY_CODE) {
      return <DisplayCode />;
    }
    return <SubmitGuess />;
  }
}
