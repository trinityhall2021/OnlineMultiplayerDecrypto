import React, { useState, useEffect } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Form, Grid, Button } from "tabler-react";

import { history, socket, cookies } from "../Components";

const Title = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`

const LandingPage = () => {

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

  const handleNameChange = (e) => setUsername(e.target.value);
  const handleCodeChange = (e) => setCode(e.target.value);

  useEffect(() => {
    let uname = cookies.get('username');
    if(typeof uname !== 'undefined'){
      setUsername(uname);
    }
  }, []);

  const submit = () => {
    // TODO: Input checking
    console.log(username);

    let room_id = "main";
    let submit_data = {
      player_name: username,
      room_id: room_id,
      code: code,
    };

    cookies.set("username", username, { path: '/' })
    socket.emit("submit_name", submit_data);
    history.push(`/game?room_id=${room_id}`);
  };

  return (
    <Grid.Col width={4} offset={4} className="mt-5 pt-5" >
      <Title>DECRYPTO</Title>
      <Form onSubmit={submit}>
        <Form.InputGroup
          append={
            <Button color="primary" type="submit">
              Play!
            </Button>
          }>
          <Form.Input onChange={handleNameChange} value={username} name='username' placeholder='Username'/>
        </Form.InputGroup>
        <Form.Input onChange={handleCodeChange} name='code' placeholder='Invite code (OPTIONAL)' className="mt-3"/>
      </Form>
    </Grid.Col>
  );
};

export default LandingPage;