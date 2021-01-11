import React, { useState, useEffect } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid } from "tabler-react";

import { Teams, Words, Actions, socket } from "../Components";

const Title = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`

let initData = {
  "teamIndex": 0,
  "teams": [
    {
      "color": "RED", 
      "intercepts": 0, 
      "misses": 0, 
      "players": [], 
      "endgame": "not yet",
      "words": ["","","",""]
    }, 
    {
      "color": "BLUE", 
      "intercepts": 0, 
      "misses": 0, 
      "players": [], 
      "endgame": "not yet",
      "words": ["","","",""]
    }
  ]
};

const GamePage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("name");

  const [ gameData, setGameData ] = useState(initData);
  useEffect(() => {
    socket.on("player_added", (data) => {
      data.teamIndex = gameData.teamIndex;
      setGameData(data);
    });
    fetch(`/state?room_id=main&user=${username}`)
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        setGameData(data);
      });
    // TODO: Fetch data via API
    setGameData(initData);
    console.log(gameData);
  }, []);
  
  return (
    <Grid>
      <Grid.Col lg={8} offsetLg={2} >
        <Title width={4} offset={4} className="mt-4 mb-3">DECRYPTO</Title>
        <Teams teamsData={gameData.teams} username={username}/>
        <Words words={gameData.teams[gameData.teamIndex].words} />
        <Actions />

      </Grid.Col>
    </Grid>
  );
};

export default GamePage;
