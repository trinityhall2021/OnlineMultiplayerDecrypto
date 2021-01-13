import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import "tabler-react/dist/Tabler.css";

import { Error404Page } from "tabler-react";

import { LandingPage, GamePage, InstructionsPage } from "./Pages";

import { history } from "./Components";

const App = () => {
  return (
    <React.StrictMode>
      <Router history={history}>
        <Switch>
          <Route exact path="/game" component={GamePage} />
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/instructions" component={InstructionsPage} />
          <Route component={Error404Page} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
};

export default App;
