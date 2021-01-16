import React, { Fragment } from "react";
import styled from "styled-components";

import "tabler-react/dist/Tabler.css";

const Section = styled.h1`
  font-family: "Cutive Mono", monospace;
  font-size: 32px;
  text-align: center;
`;

const Waiting = () => {
  return (
    <Fragment>
      <Section className="mt-0 mb-2">WAITING FOR GAME TO START</Section>
    </Fragment>
  );
};

export default Waiting;
