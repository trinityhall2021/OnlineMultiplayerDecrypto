import React, { Fragment } from "react";
import styled from "styled-components";
import "tabler-react/dist/Tabler.css";
import { Grid, Card } from "tabler-react";

const WordText = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 30px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
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
  let corresponding_clues;
  let wordColor;
  if (props.teamColor === 0) {
    if (props.userState === 'intercepting') {
      corresponding_clues = props.blueTeamClues
      wordColor = 1
    } else {
      corresponding_clues = props.redTeamClues
      wordColor = 0
    }
  } else {
    if (props.userState === 'intercepting') {
      corresponding_clues = props.redTeamClues
      wordColor = 0
    } else {
      corresponding_clues = props.blueTeamClues
      wordColor = 1
    }
  }
  console.log({corresponding_clues})
  let words;
  if (props.userState === 'intercepting') {
    words = props.words.map((w, i) => <Word word={'???'} key={i} teamColor={wordColor} clues={corresponding_clues[i]}/>);
  } else {
    words = props.words.map((w, i) => <Word word={w} key={i} teamColor={wordColor} clues={corresponding_clues[i]}/>);
  }
  let word_clues0 = corresponding_clues[0].map((c, j) => <p>{c}</p>)
  let word_clues1 = corresponding_clues[1].map((c, j) => <p>{c}</p>)
  let word_clues2 = corresponding_clues[2].map((c, j) => <p>{c}</p>)
  let word_clues3 = corresponding_clues[3].map((c, j) => <p>{c}</p>)
  return (
    <Fragment>
      <Section width={4} offset={4} className="mt-0 mb-2">
        WORDS
      </Section>
      <Grid.Row alignItems="center" className="px-5 mx-5 text-center">
        <Grid.Col>1</Grid.Col>
        <Grid.Col>2</Grid.Col>
        <Grid.Col>3</Grid.Col>
        <Grid.Col>4</Grid.Col>
      </Grid.Row>
      <Grid.Row cards alignItems="center" className="px-5 mx-5">
        {words}
      </Grid.Row>
      <Grid.Row className="px-5 mx-5 text-center">
        <Grid.Col>{word_clues0}</Grid.Col>
        <Grid.Col>{word_clues1}</Grid.Col>
        <Grid.Col>{word_clues2}</Grid.Col>
        <Grid.Col>{word_clues3}</Grid.Col>
      </Grid.Row>
    </Fragment>
  );
};

const Word = (props) => {
  console.log(props.clues)
  const teamColor = props.teamColor === 0 ? "danger" : "primary";
  let word = <WordText>{props.word}</WordText>
  return (
    <Grid.Col className="text-center">
      <Card statusColor={teamColor} className="px-3 py-3">
        {word}
      </Card>
    </Grid.Col>
  );
};

export default Words;
