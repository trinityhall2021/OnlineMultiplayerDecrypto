import React, { useState, useEffect } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid } from "tabler-react";

import { Teams, Words, Actions, socket, cookies } from "../Components";

const Title = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`

let testData = {
  teams: [
    {
      color: "red",
      players: [
        "th0m4s",
        "Cory",
        "Andrey"
      ],
      misses: 0,
      intercepts: 0
    },
    {
      color: "blue",
      players: [
        "Gordon",
        "Brenda",
        "Brian"
      ],
      misses: 0,
      intercepts: 0
    }
  ],
  words: ["Hello", "World", "Weird", "Flex"],
};

const GamePage = () => {
  const username = cookies.get("username");

  const [ gameData, setGameData ] = useState(testData);
  useEffect(() => {
    // TODO: Fetch data via API
    // socket.on("player_added", (data) => {
    //   setGameData(data);
    // });
    setGameData(testData);
    console.log(gameData);
  }, []);
  
  return (
    <Grid>
      <Grid.Col lg={8} offsetLg={2} >
        <Title width={4} offset={4} className="mt-4 mb-3">DECRYPTO</Title>

        <Teams teamsData={gameData.teams} username={username}/>
        <Words words={gameData.words} />
        <Actions />

      </Grid.Col>
    </Grid>
  );
};

export default GamePage;