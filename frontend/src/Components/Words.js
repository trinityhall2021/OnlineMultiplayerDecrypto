import React, { Fragment } from "react";
import styled from "styled-components";
import "tabler-react/dist/Tabler.css";
import { Grid, Card } from "tabler-react";

const WordText = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 40px;
  text-align: center;
  margin-top: 70px;
  margin-bottom: 70px;
`;
const indexText = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 40px;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const Words = (props) => {
  console.log(props.words);
  let words = props.words.map((w, i) => <Word word={w} key={i} teamColor={props.teamColor}/>);
  return (
    <Fragment>
      <Section width={4} offset={4} className="mt-0 mb-2">
        WORDS
      </Section>
      <Grid.Row cards alignItems="center" className="px-5 mx-5">
        {words}
      </Grid.Row>
    </Fragment>
  );
};

const Word = (props) => {
  console.log(props.teamColor)
  const teamColor = props.teamColor === 0 ? "danger" : "primary";
  return (
    <Grid.Col>
      <Card statusColor={teamColor} className="px-3 py-3">
        <WordText>{props.word}</WordText>
      </Card>
    </Grid.Col>
  );
};

export default Words;
