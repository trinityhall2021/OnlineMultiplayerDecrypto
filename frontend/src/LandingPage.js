import React, { Component } from "react";
import "./LandingPage.css";
import socket from "./Socket";
import history from "./history";

function submitNameAndJoinGame(name) {
  console.log(name);
  let room_id = "main";
  socket.emit("submit_name", {
    player_name: name,
    room_id: room_id,
  });
  history.push(`/game?room_id=${room_id}&name=${name}`);
}

class LandingPage extends Component {
  render() {
    return (
      <div>
        <link
          href="https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap"
          rel="stylesheet"
        />
        <h1>Decrypto</h1>
        <input type="text" id="fname" name="fname" />
        <button
          onClick={() =>
            submitNameAndJoinGame(document.getElementById("fname").value)
          }
        >
          Submit
        </button>
      </div>
    );
  }
}

export default LandingPage;
