import React, { Component } from "react";
import './App.scss';
import './libs/animate/animate.css';
import GameController from "./components/GameController";

export default class App extends Component {
  
  render() {
    return (
        <div className="app">
            <GameController></GameController>
        </div>
    );
  }
}
