import React, { useState } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Form, Grid, Button } from "tabler-react";

import { history } from "../Components";

const Title = styled.h1 `
  font-family: "Cutive Mono", monospace;
  font-size: 48px;
  text-align: center;
`

const LandingPage = () => {

  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    // console.log(e.target.value);
    setUsername(e.target.value);
  };

  const submit = () => {
    console.log(username);
    // TODO: Input checking
    // TODO: API Call
    // let room_id = "main";
    // socket.emit("submit_name", {
    //   player_name: name,
    //   room_id: room_id,
    // });
    // history.push(`/game?room_id=${room_id}&name=${name}`);
    history.push(`/game?room_id=main&name=${username}`);
  };

  return (
    <Grid.Col width={4} offset={4} className="mt-5 pt-5" >
      <Title>DECRYPTO</Title>
      <Form.InputGroup
        append={
          <Button onClick={submit} color="primary">
            Play!
          </Button>
        }>
        <Form.Input onChange={handleChange} name='username' placeholder='Username'/>
      </Form.InputGroup>
    </Grid.Col>
  );
};

export default LandingPage;