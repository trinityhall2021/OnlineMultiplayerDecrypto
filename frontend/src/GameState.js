import React, { Component } from "react";
import socketIOClient from "socket.io-client";

export const SUBMIT_GUESS = 0;
export const INTERCEPT = 1;
export const DISPLAY_CODE = 2;

const socket = socketIOClient("127.0.0.1:5000");
function Submit(props) {
  return (
    <div>
      <h3>{props.title}</h3>
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
      <select name="code-3" id="code-3">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <button onClick={props.onClick}>Submit</button>
    </div>
  );
}

function SubmitGuess(props) {
  return <Submit title="Submit Guess" />;
}

function Intercept(props) {
  function handleInterceptClick(e) {
    const guess_list = [];
    e.preventDefault();
    console.log("The button was clicked");
    guess_list.push(document.getElementById("code-1").value);
    guess_list.push(document.getElementById("code-2").value);
    // guess_list.push(document.getElementById("code-3").value);

    socket.emit("interceptSubmitted", guess_list);
  }
  return <Submit title="Intercept Guess" onClick={handleInterceptClick} />;
}

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
  if (props.gamestate === SUBMIT_GUESS) {
    return <SubmitGuess />;
  } else if (props.gamestate === INTERCEPT) {
    return <Intercept />;
  } else if (props.gamestate === DISPLAY_CODE) {
    return <DisplayCode codecard={props.codecard} />;
  }
  return <SubmitGuess />;
}
