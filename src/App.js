import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Lobby from "./components/Lobby";

export default class App extends Component {
  constructor() {
    super();
    this.setUser = this.setUser.bind(this);
    this.handleSelectedOptions = this.handleSelectedOptions.bind(this);
    this.setUser = this.setUser.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleJoinGame = this.handleJoinGame.bind(this);
    this.handleGameStatus = this.handleGameStatus.bind(this);
    this.handleSetScreen = this.handleSetScreen.bind(this);
    this.state = {
      user: null,
      screen: "Login", //Menu, Lobby, Game
      gameStatus: null, //StartedOnline, StartedLocal, Joined
      gameId: null,
      selectedOptions: null,
      serverComm: null
    }
  }

  componentDidMount() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user !== null) {
      this.setUser(user);
    }
  }

  setServerComm(serverComm) {
    this.setState({ serverComm });
  }

  setUser(user) {
    this.setState({ user, screen: "Menu" });
    localStorage.setItem('user', JSON.stringify(user));
  }

  handleStartGame() {
    this.handleGameStatus("Started");
    this.handleSetScreen("Game");
  }

  handleJoinGame(gameId) {
    this.setState({ gameId });
    this.handleGameStatus("Joined");
    this.handleSetScreen("Game");
  }

  handleEndGame() {

  }

  handleSelectedOptions(selectedOptions) {
    this.setState({ selectedOptions });
    // See if the last option for the game type is set and start game if so
    // 01 - InOut setting
    if (selectedOptions && selectedOptions.type && selectedOptions.type.Name === "01" && selectedOptions.inOut !== null) {
        this.handleStartGame();
    }
    // Cricket - SingleDouble Bull setting
    else if (selectedOptions && selectedOptions.type && selectedOptions.type.Name === "Cricket" && selectedOptions.inOut !== null) {
        this.handleStartGame();
    }
  }

  handleGameStatus(gameStatus) {
    this.setState({ gameStatus });
  }

  handleSetScreen(screen) {
    this.setState({ screen });
  }

  render() {
    if (this.state.user === null || this.state.screen === "Login") {
      return (
        <div className="app">
            <Login setUser={this.setUser}></Login>
        </div>
      );
    }
    else if (this.state.screen === "Menu") {
      return (
          <div className="app">
              <Menu user={this.state.user} 
                handleSelectedOptions={this.handleSelectedOptions} 
                handleSetScreen={this.handleSetScreen}>
              </Menu>
          </div>
      );
    }
    else if (this.state.screen === "Lobby") {
      return (
          <div className="app">
              <Lobby user={this.state.user} handleJoinGame={this.handleJoinGame}></Lobby>
          </div>
      );
    }
    else if (this.state.screen === "Game") {
      return (
          <div className="app">
              <GameController user={this.state.user} gameId={this.state.gameId} gameStatus={this.state.gameStatus} selectedOptions={this.state.selectedOptions}></GameController>
          </div>
      );
    }
    else {
      return (
        <div>Error</div>
      );
    }

  }
}
