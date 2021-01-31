import React, { Fragment, useState } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Card, Button } from "tabler-react";
import socket from "./Socket";

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const WordText = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 40px;
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
`;

const GiveClue = (props) => {
  let codecard = "";
  for (let i = 0; i < 3; i++) {
    codecard += props.playerData.codeCard[i];
    codecard += " ";
  }

  const [clue0, setClue0] = useState("");
  const [clue1, setClue1] = useState("");
  const [clue2, setClue2] = useState("");

  const submit_clue = () => {
    console.log(clue0)
    console.log(clue1)
    console.log(clue2)

    let submit_clues = {
      room_id: props.room_id,
      player: props.username,
      guess_type: props.playerData.userState,
      clues: [clue0, clue1, clue2]
    }

    socket.emit("submit_clues", submit_clues);
  }

  let placeholders = props.playerData.codeCard.map(n => `Hint for ${props.playerData.words[n-1]}`);
  return (
    <Fragment>
      <Section className="mt-0 mb-2">GIVE CLUE</Section>
      <Grid.Row className="px-5 mx-5">
        <Grid.Col>
          <Card className="px-3 py-3 h-100">
            <WordText>{codecard}</WordText>
          </Card>
        </Grid.Col>
        <Grid.Col>
          <Card className="px-3 py-3 h-100 mt-auto mb-auto">
            <form>
              <input
                class="form-control my-3"
                type="text"
                placeholder={placeholders[0]}
                onChange={(e) => setClue0(e.target.value)}
              ></input>
              <input
                class="form-control my-3"
                type="text"
                placeholder={placeholders[1]}
                onChange={(e) => setClue1(e.target.value)}
              ></input>
              <input
                class="form-control my-3"
                type="text"
                placeholder={placeholders[2]}
                onChange={(e) => setClue2(e.target.value)}
              ></input>
            </form>
            <Button 
              type="submit" 
              class="btn btn-primary w-100" 
              color="info"
              onClick={submit_clue}>
                Submit
            </Button>
          </Card>
        </Grid.Col>
      </Grid.Row>
    </Fragment>
  );
};

export default GiveClue;
