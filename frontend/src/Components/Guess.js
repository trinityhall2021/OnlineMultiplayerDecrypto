import React, { Fragment , useState} from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Form, Card, Button } from "tabler-react";

import { socket } from "../Components";

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const Guess = (props) => {
  const [guess1, setGuess1] = useState("");
  const [guess2, setGuess2] = useState("");
  const [guess3, setGuess3] = useState("");

  const submit = () => {

    // TODO: Input checking
    console.log(guess1);
    console.log(guess2);
    console.log(guess3);

    let submit_guesses = {
      room_id : "main",
      player: props.username,
      guess_type: props.playerData.userState,
      guess : [parseInt(guess1), parseInt(guess2), parseInt(guess3)]
    };

    socket.emit("submit_guess", submit_guesses);
  };

  return (
    <Fragment>
      <Section width={4} offset={4} className="mt-0 mb-2">
        GUESSES
      </Section>
      <Grid.Row cards alignItems="center" className="px-5 mx-5">
        <Card width={4} className="px-5 mx-5 py-5">
          <Form.Group className="my-1">
            <Form.SelectGroup color="success" onChange={(e) => setGuess1(e.target.value)}>
              <Form.SelectGroupItem label="1" name="guess1" value="1" />
              <Form.SelectGroupItem label="2" name="guess1" value="2" />
              <Form.SelectGroupItem label="3" name="guess1" value="3" />
              <Form.SelectGroupItem label="4" name="guess1" value="4" />
            </Form.SelectGroup>
          </Form.Group>
          <Form.Group className="my-1">
            <Form.SelectGroup color="success" onChange={(e) => setGuess2(e.target.value)}>
              <Form.SelectGroupItem label="1" name="guess2" value="1" />
              <Form.SelectGroupItem label="2" name="guess2" value="2" />
              <Form.SelectGroupItem label="3" name="guess2" value="3" />
              <Form.SelectGroupItem label="4" name="guess2" value="4" />
            </Form.SelectGroup>
          </Form.Group>
          <Form.Group className="my-1">
            <Form.SelectGroup color="success" onChange={(e) => setGuess3(e.target.value)}>
              <Form.SelectGroupItem label="1" name="guess3" value="1" />
              <Form.SelectGroupItem label="2" name="guess3" value="2" />
              <Form.SelectGroupItem label="3" name="guess3" value="3" />
              <Form.SelectGroupItem label="4" name="guess3" value="4" />
            </Form.SelectGroup>
          </Form.Group>
          <Button 
            className="my-1"
            width={2}
            color="info"
            type='submit'
            onClick={submit}
            >
            Submit
          </Button>
        </Card>
      </Grid.Row>
    </Fragment>
  );
};

export default Guess;
