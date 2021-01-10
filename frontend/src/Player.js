import React, { Component } from "react";
import "./Player.css";

function Player(props) {
  return (
    <div className="player">
      <p> Name: {props.name} </p>
      <p> Team: {props.team} </p>
    </div>
  );
}

export default Player;
