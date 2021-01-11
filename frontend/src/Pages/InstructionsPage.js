import React from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";
import { Grid, Button } from "tabler-react";

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

const InstructionsPage = () => {
  return (
    <Grid.Col width={4} offset={4} className="mt-5 pt-5" >
      <Title>DECRYPTO</Title>
      <Section>Instructions</Section>
      {/* TODO */}
    </Grid.Col>
  );
};

export default InstructionsPage;