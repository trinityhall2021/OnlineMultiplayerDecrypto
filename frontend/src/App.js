import React, { Component } from "react";
import "./App.css";
import Game from "./Game";
import LandingPage from "./LandingPage";
import { Router, Switch, Route } from "react-router-dom";

import history from "./history";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router history={history}>
          <Switch>
            <Route path="/game" exact component={Game} />
            <Route path="/" exact component={LandingPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
