import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Lobby from "./components/Lobby";
import { ServerComm } from "./libs/signalR/serverComm";

export default class App extends Component {
  constructor() {
    super();
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
    console.log("Process Env: " + process.env.NODE_ENV);
    let user = JSON.parse(localStorage.getItem('user'));
    let serverComm = new ServerComm();
    this.setServerComm(serverComm);
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

  handleStartGame(host) {
    this.handleGameStatus(`Started${host}`);
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
    // Once the settings are chosen (after game type and variation), start the game
    // 01
    if (selectedOptions && selectedOptions.type && selectedOptions.type.Name === "01" && selectedOptions.settings !== null) {
        this.handleStartGame(selectedOptions.host);
    }
    // Cricket
    else if (selectedOptions && selectedOptions.type && selectedOptions.type.Name === "Cricket" && selectedOptions.settings !== null) {
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
              <Lobby
                  user={this.state.user}
                  serverComm={this.state.serverComm}
                  handleJoinGame={this.handleJoinGame}
                  handleSetScreen={this.handleSetScreen}></Lobby>
          </div>
      );
    }
    else if (this.state.screen === "Game") {
      return (
          <div className="app">
              <GameController
                  user={this.state.user}
                  serverComm={this.state.serverComm}
                  gameId={this.state.gameId}
                  gameStatus={this.state.gameStatus}
                  selectedOptions={this.state.selectedOptions}></GameController>
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
