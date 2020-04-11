import React, { Component } from 'react';
import UIfx from 'uifx';
import BoardController from "./BoardController";
import CenterScore from "./CenterScore";
import DartIndicator from "./DartIndicator";
import EndTurnButton from './EndTurnButton';
import PlayerScore from './PlayerScore';
import Transition from './Transition';
import DebugThrowDart from '../debug_components/DebugThrowDart';

export default class GameController extends Component {
    constructor(props) {
        super(props);
        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.addRoundDart = this.addRoundDart.bind(this);
        this.handleEndTurn = this.handleEndTurn.bind(this);
        this.changeActivePlayer = this.changeActivePlayer.bind(this);
        this.handleBust = this.handleBust.bind(this);

        this.state = {
            clientInfo: { id: 1, name: "Drew" },
            gameOptions: this.props.gameOptions,
            players: [
                { id: 1, name: "Drew", score: 501 },
                { id: 2, name: "Player 2", score: 501 }
            ],
            activePlayer: {},
            winningPlayer: {},
            turnDarts: [],
            tempScore: 0,
            transitioning: false,
            transitionLabel: ""
        };
    }

    componentDidMount() {
        this.dartSound = new UIfx(process.env.PUBLIC_URL + "/audio/dartSound.mp3");
        var newTempScore = this.state.gameOptions.startScore;
        this.setState({ tempScore: newTempScore, activePlayer: { index: 0, id: this.state.players[0].id } });
    }

    addRoundDart(dart) {
        var newTurnDarts = this.state.turnDarts;
        newTurnDarts.push(dart);
        this.setState({ turnDarts: newTurnDarts });
    }

    changeActivePlayer() {
        var newIndex = this.nextPlayerIndex();
        var newId = this.state.players[newIndex].id;
        this.setState({ activePlayer: { index: newIndex, id: newId } });
    }

    // Used to get player name for transition
    // If last player is active then cycle back to first player
    // Else, increment by 1
    nextPlayerIndex() {
        var numPlayers = this.state.players.length;
        if ((this.state.activePlayer.index + 1) === numPlayers) {
            return 0;
        }
        else {
            return this.state.activePlayer.index + 1;
        }
    }
    
    handlePlayerAction(playerAction) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (!playerAction.player.isActive || this.state.transitioning) return;

        if (playerAction.type === "endTurn") {
            this.handleEndTurn(true);
        }

        if (playerAction.type === "throwDart") {
            this.handleThrowDart(playerAction.action.dart);
            // Moved handleEndTurn to a callback inside setState inside handleThrowDart
            // because the async setState wasn't updating state in time to get new values
            // this.handleEndTurn(false);
        }
    }

    handleThrowDart(dart) {
        this.dartSound.play();

        this.addRoundDart(dart);
        var dartValue = dart.mark * dart.multiplier;
        var newTempScore = this.state.tempScore - dartValue;

        // Check for bust
        if (newTempScore < 0) {
            this.handleBust();
        }
        else if (newTempScore === 0) {
            this.setState({ tempScore: newTempScore }, () => {
                this.handleWinGame();
            });
        }
        else {
            this.setState({ tempScore: newTempScore }, () => {
                this.handleEndTurn(false);
            });
        }
    }

    handleBust() {
        this.setState({
            transitionLabel: "Bust!  Next Player Is Up",
            transitioning: true
        });

        setTimeout(() => {
            this.changeActivePlayer();
            this.setState({
                transitioning: false,
                tempScore: this.state.players[this.state.activePlayer.index].score,
                turnDarts: []
            });
        }, 5000);
    }

    handleWinGame() {
        var playerName = this.state.players[this.state.activePlayer.index].name;
        this.setState({
            transitionLabel: `${playerName} Wins!!!`,
            transitioning: true
        });
    }

    handleEndTurn(force) {
        if (force || this.state.turnDarts.length === 3) {
            
            var nextPlayerName = this.state.players[this.nextPlayerIndex()].name;
            this.setState({
                transitionLabel: `End of Turn - ${nextPlayerName} Is Up`,
                transitioning: true
            });

            var newPlayers = this.state.players;
            var newActivePlayer = newPlayers[this.state.activePlayer.index];
            newActivePlayer.score = this.state.tempScore;
            newPlayers[this.state.activePlayer.index] = newActivePlayer;

            setTimeout(() => {
                this.changeActivePlayer();
                this.setState({
                    transitioning: false,
                    turnDarts: [],
                    tempScore: this.state.players[this.state.activePlayer.index].score,
                    players: newPlayers
                });
            }, 3000);
        }
    }


    render() {
        return (
            <div className="game-controller">
                <div className="header">
                    <DebugThrowDart
                        label="Single 10"
                        value="35-45"
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                    <DebugThrowDart
                        label="Triple 20"
                        value="39-28"
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                    <DebugThrowDart
                        label="Triple 7"
                        value="39-25"
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                    <BoardController
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></BoardController>
                </div>

                <div className="main-area">
                    {this.state.transitioning && <Transition label={this.state.transitionLabel}></Transition>}

                    {this.state.players[this.state.activePlayer.index] && (
                        <CenterScore
                            name={this.state.players[this.state.activePlayer.index].name}
                            score={this.state.tempScore}></CenterScore>
                    )}
                </div>

                <div className="user-area">
                    {this.state.players && (
                        <PlayerScore
                            name={this.state.players[0].name}
                            score={this.state.players[0].score}></PlayerScore>
                    )}

                    <EndTurnButton
                        handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></EndTurnButton>

                    {this.state.players && (
                        <PlayerScore
                            name={this.state.players[1].name}
                            score={this.state.players[1].score}></PlayerScore>
                    )}
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
