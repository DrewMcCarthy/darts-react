import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";
import Login from "./components/Login";
import Menu from "./components/Menu";

export default class App extends Component {
  // Check localStorage for user and setState if there
  // If not there display Login with an option to register
  // If there go to choose online/offline -> choose game
  constructor() {
    super();
    this.setUser = this.setUser.bind(this);
    this.handleSelectOptions = this.handleSelectOptions.bind(this);
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

  handleSelectOptions(selectedOptions) {
    this.setState({ selectedOptions });
  }

  render() {
    if (this.state.user === null) {
      return (
        <div className="app">
            <Login setUser={this.setUser}></Login>
        </div>
      );
    }
    else if (this.state.selectedOptions === null) {
      return (
          <div className="app">
              <Menu user={this.state.user} handleSelectOptions={this.handleSelectOptions}></Menu>
          </div>
      );
    }
    else {
      return (
          <div className="app">
              <GameController user={this.state.user} selectedOptions={this.state.selectedOptions}></GameController>
          </div>
      );
    }

  }
}
