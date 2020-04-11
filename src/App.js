import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";
import Login from "./components/Login";
import Menu from "./components/Menu";
import ServerComm from "./components/ServerComm";

export default class App extends Component {
  // Check localStorage for user and setState if there
  // If not there display Login with an option to register
  // If there go to choose online/offline -> choose game
  constructor() {
    super();
    this.setUser = this.setUser.bind(this);
    this.handleOptionSelection = this.handleOptionSelection.bind(this);
    this.state = {
      user: null,
      selectedOptions: null
    }
  }

  componentDidMount() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user !== null) {
      this.setState({ user });
    }
  }


  setUser(user) {
    this.setState({ user });
    localStorage.setItem('user', JSON.stringify(user));
  }

  handleOptionSelection(selectedOptions) {
    this.setState({ selectedOptions });
  }

  render() {
    if (this.state.user === null) {
      return (
        <div className="app">
            <Login setUser={this.setUser}></Login>
            <ServerComm></ServerComm>
        </div>
      );
    }
    else if (this.state.selectedOptions === null) {
      return (
          <div className="app">
              <Menu JwtToken={this.state.user.JwtToken} handleOptionSelection={this.handleOptionSelection}></Menu>
          </div>
      );
    }
    else {
      return (
          <div className="app">
              <GameController selectedOptions={this.state.selectedOptions}></GameController>
          </div>
      );
    }

  }
}
