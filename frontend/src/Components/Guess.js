import React, { Fragment, useState, useEffect } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Form, Card, Button, Header } from "tabler-react";

import { socket } from "../Components";

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const GuessBox = (props) => {
return (
  <Form.SelectGroup
    canSelectMultiple="false"
    color="success"
    onChange={(e) => {
      props.set_guess_fn(e.target.value)
    }}>
  <Form.SelectGroupItem label="1" name="choice1" value="1" />
  <Form.SelectGroupItem label="2" name="choice2" value="2" />
  <Form.SelectGroupItem label="3" name="choice3" value="3" />
  <Form.SelectGroupItem label="4" name="choice4" value="4" />
</Form.SelectGroup>
)

}

const Guess = (props) => {
  const [guess1, setGuess1] = useState("");
  const [guess2, setGuess2] = useState("");
  const [guess3, setGuess3] = useState("");

  let guess1_box = <GuessBox set_guess_fn={setGuess1} guessval="guess1" />
  let guess2_box = <GuessBox set_guess_fn={setGuess2} guessval="guess2" />
  let guess3_box = <GuessBox set_guess_fn={setGuess3} guessval="guess3" />

  const submit = () => {
    // TODO: Input checking
    console.log(guess1);
    console.log(guess2);
    console.log(guess3);

    let submit_guesses = {
      room_id: "main",
      player: props.username,
      guess_type: props.playerData.userState,
    };

    socket.emit("submit_guess", submit_guesses);
  };

  useEffect(() => {
    // a player from the same team makes a guess, 
    socket.on("broadcast_clues", (data) => {
      console.log('Potential guesses')
      console.log(data)
      let guesses = data.guesses
      guesses.map((guess, i) => {
        switch(guess) {
          case "1":
            console.log("1 is chosen");
            break;
          case "2":
            console.log("2 is chosen");
            break;
          case "3":
            console.log("3 is chosen");
            break;
          case "4":
            console.log("4 is chosen");
            break;
          default:
            console.log("nothing is chosen");
        }
      })
      guess1_box.onChange();
      // set check to true
    });
  }, [])




  useEffect(() => {
    
    // This handles the scenario where a user on the team clicked a guess, the 
    // rest of the team should be able to see what guess he/she clicked for better
    // team synchronization
    let potential_guess = {
      room_id: "main",
      player_team: props.playerData.teamIndex,
      guess: [guess1, guess2, guess3],  // there is a possibility that the guesses are empty
    }
    socket.emit("clicked_potential_guess", potential_guess)
  }, [guess1, guess2, guess3])


  return (
    <Fragment>
      <Section width={4} offset={4} className="mt-0 mb-2">
        GUESSES
      </Section>
      <Grid.Row cards alignItems="center" className="px-5 mx-5">
        <Card width={4} className="px-5 mx-5 py-5">
          <Form.Group className="my-1">
          <p>Select best guess for <strong>{props.clueData.clue0}</strong></p>
            {guess1_box}
          </Form.Group>
          <Form.Group className="my-1">
          <p>Select best guess for <strong>{props.clueData.clue1}</strong></p>
            {guess2_box}
          </Form.Group>
          <Form.Group className="my-1">
          <p>Select best guess for <strong>{props.clueData.clue2}</strong></p>
            {guess3_box}
          </Form.Group>
          <Button
            className="my-1"
            width={2}
            color="info"
            type="submit"
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
