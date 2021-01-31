import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";

import "tabler-react/dist/Tabler.css";
import { Form, Grid, Button } from "tabler-react";

import { history, socket } from "../Components";

const Title = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`;

socket.on("error_joining", (data) => {
  alert(data['err_msg'])
})

socket.on("user_joined", (data) => {
  let room_id = data.room_id;
  let username = data.username;
  history.push(`/game?room_id=${room_id}&name=${username}`);
})

const LandingPage = () => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const handleNameChange = (e) => setUsername(e.target.value);
  const handleCodeChange = (e) => setCode(e.target.value);

  const submit = (e) => {
    e.preventDefault();
    const goto_gamePage = (new_room_id) => {
      let submit_data = {
        player_name: username,
        room_id: new_room_id,
        code: code,
      };
      let room_id = new_room_id;
      socket.emit("submit_name", submit_data);
    };

    let room_id;
    let new_room_id;
    if (code.length === 0) {
      console.log("Trying to create a")
      fetch(`/create_room`)
      .then((resp) => resp.json())
      .then((data) => {
        // user didn't specify a room code, we assume the user wants to 
        // create a room
        new_room_id = data["room_name"];
        return new_room_id
      })
      .then((new_room_id) => {
        goto_gamePage(new_room_id)
      });

    } else {
      // TODO: handle situation where room name is not valid
      console.log(code)
      fetch(`/join_room?room_id=${code}`)
      .then((resp) => resp.json())
      .then((data) => {
        let success_status = data["found_room"];
        return success_status;
      })
      .then((success_status) => {
        if (success_status === "failed") {
          setErrorCode("room not found")
          console.log("join room failed")
        } else {
          // room found
          goto_gamePage(code)
        }
      })
    }
  };

  useEffect(() => {
    // setErrorCode("ROOM NOT FOUND")
  }, [errorCode])

  return (
    <Grid.Col width={4} offset={4} className="mt-5 pt-5">
      <Title>UNCRYPTO</Title>
      <Form>
        <Form.InputGroup
          append={
            <Button color="primary" type="button" onClick={submit}>
              Play!
            </Button>
          }
        >
          <Form.Input
            onChange={handleNameChange}
            name="username"
            placeholder="Username"
          />
        </Form.InputGroup>
        <Form.Input
          onChange={handleCodeChange}
          name="code"
          placeholder="Invite code (OPTIONAL)"
          className="mt-3"
          error={errorCode}
        />
      </Form>
      <Link to="/instructions">Instructions</Link>
    </Grid.Col>
  );
};

export default LandingPage;
