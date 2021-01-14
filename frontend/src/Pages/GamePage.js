import React, { useState, useEffect, Fragment } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid  } from "tabler-react";

import { Teams, Words, Guess, socket, GiveClue , Waiting} from "../Components";

const Title = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`;

let initData = {
  teamIndex : -1,
  playerIndex : -1,
  userState: "waiting",
  codeCard: [],
  teams: [
    {
      color: "RED",
      intercepts: 0,
      misses: 0,
      players: [],
      endgame: "not yet",
      words: ["", "", "", ""],
    },
    {
      color: "BLUE",
      intercepts: 0,
      misses: 0,
      players: [],
      endgame: "not yet",
      words: ["", "", "", ""],
    },
  ],
};

const GamePage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("name");

  const [gameData, setGameData] = useState(initData);
  useEffect(() => {
    socket.on("player_added", (data) => {
      data.teamIndex = gameData.teamIndex
      data.playerIndex = gameData.playerIndex
      data.teams[0].words = gameData.teams[0].words
      data.teams[1].words = gameData.teams[1].words
      setGameData(data);
      console.log("added_player")
      console.log(gameData)
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

  console.log(gameData.teamIndex)
  console.log(gameData.playerIndex)

  const action =
    gameData.teamIndex === -1 || gameData.playerIndex === -1 ? (
        <Fragment />
    ) : gameData.teams[gameData.teamIndex].players[gameData.playerIndex].state === "guessing" ? (
      <Guess gameData={gameData} />
    ) : gameData.teams[gameData.teamIndex].players[gameData.playerIndex].state === "intercepting" ? (
      <Guess gameData={gameData} />
    ) : gameData.teams[gameData.teamIndex].players[gameData.playerIndex].state === "giving" ? (
      <GiveClue gameData={gameData} />
    ) : (
      <Fragment />
    )

  const words = 
      gameData.teamIndex === -1 || gameData.playerIndex === -1 ? (
        <Fragment />
      ) : (
        <Words words={gameData.teams[gameData.teamIndex].words} />
      )

  return (
    <Grid>
      <Grid.Col lg={8} offsetLg={2}>
        <Title width={4} offset={4} className="mt-4 mb-3">
          DECRYPTO
        </Title>
        <Teams teamsData={gameData.teams} username={username} />
        {words}
        {action}
      </Grid.Col>
    </Grid>
  );
};

export default GamePage;
