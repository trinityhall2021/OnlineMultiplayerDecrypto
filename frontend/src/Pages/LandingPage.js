import React, { useState } from "react";
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

  const handleNameChange = (e) => setUsername(e.target.value);
  const handleCodeChange = (e) => setCode(e.target.value);

  const submit = (e) => {
    // TODO: Input checking
    e.preventDefault();
    console.log(username);
    let success = false;
    let room_id = "main";
    let submit_data = {
      player_name: username,
      room_id: room_id,
      code: code,
    };
    socket.emit("submit_name", submit_data);
  };

  return (
    <Grid.Col width={4} offset={4} className="mt-5 pt-5">
      <Title>DECRYPTO</Title>
      <Form onSubmit={submit}>
        <Form.InputGroup
          append={
            <Button color="primary" type="submit">
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
        />
      </Form>
      <Link to="/instructions">Instructions</Link>
    </Grid.Col>
  );
};

export default LandingPage;
