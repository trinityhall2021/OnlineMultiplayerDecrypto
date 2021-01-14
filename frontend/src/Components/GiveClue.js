import React, { Fragment } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Card } from "tabler-react";

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const WordText = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 40px;
  text-align: center;
  margin-top: 70px;
  margin-bottom: 70px;
`;

const GiveClue = (props) => {
  let codecard = "";
  for (let i = 0; i < 3; i++) {
    codecard += props.codecard[i];
    codecard += " ";
  }

  return (
    <Fragment>
      <Section className="mt-0 mb-2">GIVE CLUE</Section>
      <Grid.Row cards alignItems="center" className="px-5 mx-5">
        <Grid.Col md={4} />
        <Grid.Col md={4}>
          <Card className="px-3 py-3">
            <WordText>{codecard}</WordText>
          </Card>
        </Grid.Col>
        <Grid.Col md={4}></Grid.Col>
      </Grid.Row>
    </Fragment>
  );
};

export default GiveClue;
