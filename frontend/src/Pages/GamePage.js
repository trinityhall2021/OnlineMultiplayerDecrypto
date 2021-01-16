import React, { useState, useEffect, Fragment, Section } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Button } from "tabler-react";

import { Teams, Words, Guess, socket, GiveClue , Waiting, EndGameMessage} from "../Components";

const Title = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`;

// This is game information that is specific to each player. These information should
// not be updated per broadcast
let initPlayerData = {
  teamIndex: -1,
  playerIndex: -1,
  userState: "waiting",
  codeCard: [],
  words: ["", "", "", ""],
};

// This is game information that is broadcasted to everyone.
let initData = {
  teams: [
    {
      color: "RED",
      intercepts: 0,
      misses: 0,
      players: [],
      endgame: "not yet",
    },
    {
      color: "BLUE",
      intercepts: 0,
      misses: 0,
      players: [],
      endgame: "not yet",
    },
  ],
};

const GamePage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("name");

  const [gameData, setGameData] = useState(initData);
  const [playerData, setPlayerData] = useState(initPlayerData);

  useEffect(() => {
    socket.on("player_added", (data) => {
      // a player is added from the server. this should only update
      // gameData and not individual playerData
      setGameData(data);
      console.log("added_player");
    });

    socket.on("update_game", (data) => {
      // a player is added from the server. this should only update
      // gameData and not individual playerData
      setGameData(data);
      console.log("update game stats");
    });

    socket.on("update_player_and_game", (data) => {
      console.log("Updating player and game");
      console.log(data);
      setPlayerData(data.playerData);
      setGameData(data.gameData);
    });

    fetch(`/state?room_id=main&user=${username}`)
      .then((resp) => resp.json())
      .then((data) => {
        // This happens when the user first joins the game,
        // and when the user hits refresh on their tab.
        // This should retrieve both their gameData and individualData
        setPlayerData(data.playerData);
        setGameData(data.gameData);
      });

    // setGameData(initData);
    // setPlayerData(initPlayerData);
  }, []);
  console.log("logging player data");
  console.log(playerData);
  console.log("logging game data");

  console.log(gameData);

  const action =
    playerData.userState === "guessing" ? (
      <Guess gameData={gameData} playerData={playerData} username={username} />
    ) : playerData.userState === "intercepting" ? (
      <Guess gameData={gameData} playerData={playerData} username={username} />
    ) : playerData.userState === "giving" ? (
      <GiveClue codeCard={playerData.codeCard} codeWords={playerData.words} />
    ) : (
      <Fragment />
    );

  return (
    <Grid>
      <Grid.Col lg={8} offsetLg={2}>
        <Title width={4} offset={4} className="mt-4 mb-3">
          DECRYPTO
        </Title>
        <EndGameMessage red_team_endgame={gameData.teams[0].endgame} blue_team_endgame={gameData.teams[1].endgame} />
        <Teams teamsData={gameData.teams} username={username} />
        <Words words={playerData.words} />
        {action}
      </Grid.Col>
    </Grid>
  );
};

export default GamePage;
