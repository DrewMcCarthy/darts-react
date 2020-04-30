import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Lobby from "./components/Lobby";
import * as Models from "./models/gameModels"
import { ServerComm } from "./libs/signalR/serverComm";

interface AppState {
  user: Models.User | null,
  screen: Models.GameScreens,
  gameStatus: Models.GameStatuses | null
  gameId: number,
  gameOptions: Models.GameOptions | null,
  serverComm: any
}

export default class App extends Component<any, AppState> {
  constructor(props: any) {
    super(props);
    this.handleGameOptions = this.handleGameOptions.bind(this);
    this.setUser = this.setUser.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleJoinGame = this.handleJoinGame.bind(this);
    this.handleGameStatus = this.handleGameStatus.bind(this);
    this.handleSetScreen = this.handleSetScreen.bind(this);
    this.state = {
      user: null,
      screen: Models.GameScreens.Login,
      gameStatus: null,
      gameId: 0,
      gameOptions: null,
      serverComm: null
    }
  }

  componentDidMount() {
    // console.log("Process Env: " + process.env.NODE_ENV);
    let localStorageUser = localStorage.getItem('user');
    localStorageUser = localStorageUser === "undefined" ? null : localStorageUser;
    let user;
    if (localStorageUser) {
      user = JSON.parse(localStorageUser);
    }

    let serverComm = new ServerComm();
    this.setServerComm(serverComm);
    if (user) {
      this.setUser(user);
    }
  }

  setServerComm(serverComm: any) {
    this.setState({ serverComm });
  }

  setUser(user: Models.User) {
    this.setState({ user, screen: Models.GameScreens.Menu });
    localStorage.setItem('user', JSON.stringify(user));
  }

  handleStartGame(gameStatus: Models.GameStatuses) {
    this.handleGameStatus(gameStatus);
    this.handleSetScreen(Models.GameScreens.Game);
  }

  handleJoinGame(gameId: number) {
    this.setState({ gameId });
    this.handleGameStatus(Models.GameStatuses.Joined);
    this.handleSetScreen(Models.GameScreens.Game);
  }

  handleGameOptions(gameOptions: Models.GameOptions, gameStatus: Models.GameStatuses) {
    this.setState({ gameOptions, gameStatus });
    // Once the settings are chosen (after game type and variation), start the game
    // 01
    if (gameOptions && gameOptions.gameType && gameOptions.gameType.name === "01" && gameOptions.gameSetting !== null) {
      this.handleStartGame(gameStatus);
    }
    // Cricket
    else if (gameOptions && gameOptions.gameType && gameOptions.gameType.name === "Cricket" && gameOptions.gameSetting !== null) {
      this.handleStartGame(gameStatus);
    }
  }

  handleGameStatus(gameStatus: Models.GameStatuses) {
    this.setState({ gameStatus });
  }

  handleSetScreen(screen: Models.GameScreens) {
    this.setState({ screen });
  }

  render() {
    if (this.state.user === null || this.state.screen === Models.GameScreens.Login) {
      return (
        <div className="app">
            <Login setUser={this.setUser}></Login>
        </div>
      );
    }
    else if (this.state.screen === Models.GameScreens.Menu) {
      return (
          <div className="app">
              <Menu user={this.state.user} 
                handleGameOptions={this.handleGameOptions} 
                handleSetScreen={this.handleSetScreen}>
              </Menu>
          </div>
      );
    }
    else if (this.state.screen === Models.GameScreens.Lobby) {
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
    else if (this.state.screen === Models.GameScreens.Game) {
      return (
          <div className="app">
              <GameController
                  user={this.state.user}
                  serverComm={this.state.serverComm}
                  gameId={this.state.gameId}
                  gameStatus={this.state.gameStatus}
                  gameOptions={this.state.gameOptions}></GameController>
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
