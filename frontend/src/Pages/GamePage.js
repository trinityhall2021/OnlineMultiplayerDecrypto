import React, { useState, Fragment } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Form, Card, Button } from "tabler-react";

import { Team, Word } from "../Components";

const Title = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`

const Section = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
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
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("name");

  let teams = testData.teams.map((t) => <Team teamData={t} username={userName}/>);
  let words = testData.words.map((w) => <Word word={w}/>);
  
  return (
    <Fragment>
      <Grid.Col lg={8} alignItems="center">
        <Title width={4} offset={4} className="mt-4 mb-3">DECRYPTO</Title>
        <Grid.Row cards alignItems="center" className="px-5 mx-5">
          {teams}
        </Grid.Row>

        <Section width={4} offset={4} className="mt-0 mb-2">WORDS</Section>
        <Grid.Row cards alignItems="center" className="px-5 mx-5">
          {words}
        </Grid.Row>

        <Section width={4} offset={4} className="mt-0 mb-2">GUESSES</Section>
        <Grid.Row cards alignItems="center" className="px-5 mx-5">
          <Card width={4} className="px-5 mx-5 py-5">
            <Form.Group className="my-1">
              <Form.SelectGroup color="success">
                <Form.SelectGroupItem
                  label="1"
                  name="guess1"
                  value="1"
                  />
                <Form.SelectGroupItem
                  label="2"
                  name="guess1"
                  value="2"
                  />
                <Form.SelectGroupItem
                  label="3"
                  name="guess1"
                  value="3"
                  />
                <Form.SelectGroupItem
                  label="4"
                  name="guess1"
                  value="4"
                  />
              </Form.SelectGroup>
            </Form.Group>
            <Form.Group className="my-1">
              <Form.SelectGroup color="success">
                <Form.SelectGroupItem
                  label="1"
                  name="guess2"
                  value="1"
                  />
                <Form.SelectGroupItem
                  label="2"
                  name="guess2"
                  value="2"
                  />
                <Form.SelectGroupItem
                  label="3"
                  name="guess2"
                  value="3"
                  />
                <Form.SelectGroupItem
                  label="4"
                  name="guess2"
                  value="4"
                  />
              </Form.SelectGroup>
            </Form.Group>
            <Form.Group className="my-1">
              <Form.SelectGroup color="success">
                <Form.SelectGroupItem
                  label="1"
                  name="guess3"
                  value="1"
                  />
                <Form.SelectGroupItem
                  label="2"
                  name="guess3"
                  value="2"
                  />
                <Form.SelectGroupItem
                  label="3"
                  name="guess3"
                  value="3"
                  />
                <Form.SelectGroupItem
                  label="4"
                  name="guess3"
                  value="4"
                  />
              </Form.SelectGroup>
            </Form.Group>
            <Button className="my-1" width={2} color="info">Submit</Button>
          </Card>
        </Grid.Row>
      </Grid.Col>
    </Fragment>
  );
};

export default GamePage;