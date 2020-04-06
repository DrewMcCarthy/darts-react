import React, { Component } from 'react'
import BoardController from "./BoardController";
import CenterScore from "./CenterScore";
import DartIndicator from "./DartIndicator";
import EndTurnButton from './EndTurnButton';
import PlayerScore from './PlayerScore';
import Transition from './Transition';
import DebugThrowDart from '../debug_components/DebugThrowDart';

export default class GameController extends Component {
    constructor() {
        super();
        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.addRoundDart = this.addRoundDart.bind(this);
        this.handleEndTurn = this.handleEndTurn.bind(this);
        this.state = {
            clientInfo: {},
            players: [],
            score: 501,
            turnDarts: [],
            transitioning: false
        }
    }

    addRoundDart(dart) {
        var newTurnDarts = this.state.turnDarts;
        newTurnDarts.push(dart);
        this.setState({ turnDarts: newTurnDarts });
    }

    handleEndTurn(force) {
        if (force || this.state.turnDarts.length === 3) {
            this.setState({ 
                transitioning: true
            });
            
            setTimeout(() => {
                this.setState({
                    transitioning: false,
                    turnDarts: []
                });
            }, 3000);

        }
    }
    
    handlePlayerAction(playerAction) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (!playerAction.player.isActive || this.state.transitioning) return;

        if (playerAction.type === "endTurn") {
            this.handleEndTurn(true);
        }

        if (playerAction.type === "throwDart") {
            var dart = playerAction.action.dart;
            this.addRoundDart(dart);

            var dartValue = dart.mark * dart.multiplier;
            this.setState({ score: this.state.score - dartValue });
        }

        this.handleEndTurn(false);
    }

    render() {
        return (
            <div id="game-controller">
                <div className="header">
                    <DebugThrowDart
                        label="Single 10"
                        value="35-45"
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                    <DebugThrowDart
                        label="Double 20"
                        value="37-28"
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                    <BoardController
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></BoardController>
                </div>

                <div className="main-area">
                    {this.state.transitioning && <Transition label="Next Player is Up"></Transition>}
                    <CenterScore name="Drew" score={this.state.score}></CenterScore>
                </div>

                <div className="user-area">
                    <PlayerScore name="Drew" score="501"></PlayerScore>

                    <EndTurnButton
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></EndTurnButton>

                    {/* Other Buttons */}

                    <PlayerScore name="Player 2" score="501"></PlayerScore>
                </div>

                <div className="footer">
                    <DartIndicator dartSeq="0" turnDarts={this.state.turnDarts}></DartIndicator>
                    <DartIndicator dartSeq="1" turnDarts={this.state.turnDarts}></DartIndicator>
                    <DartIndicator dartSeq="2" turnDarts={this.state.turnDarts}></DartIndicator>
                </div>
            </div>
        );
    }
}
