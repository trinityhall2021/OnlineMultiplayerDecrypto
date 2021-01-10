import React, { Fragment } from "react";
import styled from "styled-components";
import "tabler-react/dist/Tabler.css";
import { Grid, Card, Header } from "tabler-react";

const WordText = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 40px;
  text-align: center;
  margin-top: 70px;
  margin-bottom: 70px;
`

const Word = (props) => {
    return (
        <Grid.Col>
        <Card
            statusColor="success"
            className="px-3 py-3"
        >
            <WordText>{props.word}</WordText>
        </Card>
        </Grid.Col>
    );
};

export default Word;