import React, { Component } from 'react'
import BoardController from "./BoardController";
import CenterScore from "./CenterScore";
import DartIndicator from "./DartIndicator";

export default class GameController extends Component {
    constructor() {
        super();
        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.addRoundDart = this.addRoundDart.bind(this);
        this.state = {
            score: 501,
            roundDarts: []
        }
    }

    addRoundDart(dart) {
        var newRoundDarts = this.state.roundDarts;
        newRoundDarts.push(dart);
        this.setState({ roundDarts: newRoundDarts });
    }
    
    handlePlayerAction(playerAction) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (!playerAction.player.isActive) return;

        if (playerAction.type === "throwDart") {
            var dart = playerAction.action.dart;
            this.addRoundDart(dart);
            
            var dartValue = dart.mark * dart.multiplier;
            this.setState({ score: this.state.score - dartValue });
        }
    }

    render() {
        return (
            <div id="game-controller">
                <div className="header">
                    <BoardController
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></BoardController>
                </div>

                <div className="main-area">
                    <CenterScore score={this.state.score}></CenterScore>
                </div>

                <div className="footer">
                    <DartIndicator dartSeq="0" roundDarts={this.state.roundDarts}></DartIndicator>
                    <DartIndicator dartSeq="1" roundDarts={this.state.roundDarts}></DartIndicator>
                    <DartIndicator dartSeq="2" roundDarts={this.state.roundDarts}></DartIndicator>
                </div>
            </div>
        );
    }
}
