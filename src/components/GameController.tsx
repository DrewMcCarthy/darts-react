import React, { Component } from 'react';
import BoardController from "./BoardController";
import CenterScore from "./CenterScore";
import DartIndicator from "./DartIndicator";
import EndTurnButton from './EndTurnButton';
import PlayerScore from './PlayerScore';
import Transition from './Transition';
import DebugThrowDart from '../debug_components/DebugThrowDart';
import GameService from '../services/GameService';
import * as Models from '../models/gameModels';
import { handlePlayerAction } from '../libs/game_rules/zeroOne';

// interface IGameController {
//     user: Models.User,
//     serverComm: any,
//     gameId: number,
//     gameStatus: string,
//     gameOptions: Models.GameOptions,
//     gameService: any,
//     dartSound: HTMLAudioElement
// }
interface GameControllerProps {
    user: Models.User;
    serverComm: any,
    gameId: number,
    gameStatus: Models.GameStatuses | null,
    gameOptions: Models.GameOptions | null
}

interface GameControllerState {
    gameState: Models.GameState
}

export default class GameController extends Component<GameControllerProps, GameControllerState> {
    user: Models.User;
    serverComm: any;
    gameId: number;
    gameStatus: Models.GameStatuses | null;
    gameOptions: Models.GameOptions | null;
    gameService: GameService;
    dartSound: HTMLAudioElement;

    constructor(props: GameControllerProps) {
        super(props);
        // props
        this.user = this.props.user;
        this.serverComm = this.props.serverComm;
        this.gameId = this.props.gameId;
        this.gameStatus = this.props.gameStatus;
        this.gameOptions = this.props.gameOptions;
        this.dartSound = new Audio(process.env.PUBLIC_URL + "/audio/dartSound.mp3");
        this.gameService = new GameService();

        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.handlePlayerActionSent = this.handlePlayerActionSent.bind(this);
        this.initPlayers = this.initPlayers.bind(this);

        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
        
        this.serverComm.sendToAllCallback = this.handleServerMessage;
        this.serverComm.joinGameCallback = this.handlePlayerJoined;
        this.serverComm.sendPlayerActionCallback = this.handlePlayerActionSent;


        this.state = {
            gameState: {
                gameId: 0,
                gameOptions: this.gameOptions,
                activePlayer: {
                    id: 0,
                    index: 0
                },
                players: [],
                turnScore: 0,
                turnDarts: [],
                transitionLabel: "",
                isTransitioning: false,
                isBust: false,
                isWinner: false,
                isTurnEnd: false,
                isWaitingForPlayers: true
            }
        };
    }

    componentDidMount() {
        let gameState = { ...this.state.gameState };
        if (this.gameStatus === Models.GameStatuses.StartedOnline) {
            this.sendGameToServer();
            let turnScore = this.state.gameState.gameOptions?.gameVariation?.startScore;
            let creator: Models.Player = {
                id: this.user.id,
                name: this.user.username,
                score: this.state.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: []
            };
            let players = [creator];
            gameState.players = players;
            gameState.turnScore = turnScore ? turnScore : 0;
            this.setState({ gameState });
        }
        else if (this.gameStatus === Models.GameStatuses.Joined) {
            this.initPlayers();
        }
        else if (this.gameStatus === Models.GameStatuses.StartedLocal) {
            let turnScore = this.state.gameState.gameOptions?.gameVariation?.startScore;
            let playerOne = {
                id: this.user.id,
                name: this.user.username,
                score: this.state.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: []
            };
            let playerTwo = {
                id: 99,
                name: "Guest",
                score: this.state.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: []
            };
            let players = [playerOne, playerTwo];
            gameState.players = players;
            gameState.activePlayer = { index: 0, id: playerOne.id };
            gameState.turnScore = turnScore ? turnScore : 0;
            gameState.isWaitingForPlayers = false;
            this.setState({ gameState });
        }
    }

    async initPlayers() {
        if (this.gameStatus === Models.GameStatuses.Joined) {
            try {
                let gameInfo = await this.gameService.getGameInfo(this.user, this.gameId);
                if (gameInfo) {
                    let creator = {
                        id: gameInfo.CreatedByUserId,
                        name: gameInfo.CreatedBy,
                        score: gameInfo.StartScore,
                        gameDarts: []
                    };
                    let joiner = { id: this.user.id, name: this.user.username, score: gameInfo.StartScore, gameDarts: [] };
                    let players = [creator, joiner];
                    let gameState = { ...this.state.gameState };
                    gameState.players = players;
                    gameState.activePlayer = { index: 0, id: creator.id };
                    gameState.turnScore = gameInfo.StartScore;
                    gameState.isWaitingForPlayers = false;
                    gameState.gameId = this.gameId;
                    this.setState({ gameState });
                }
            } catch (error) {
                alert (error);
            }
        }
    }

    handleServerMessage(receivedMessage: string) {
        console.log(receivedMessage);
    }

    // If hosting, this is called when other players join
    handlePlayerJoined(userId: number, username: string) {
        console.log(`Player Joined - ID:${userId} - Name:${username}`);
        let players = [...this.state.gameState.players];
        let joiner = { id: userId, name: username, score: this.state.gameState.gameOptions?.gameVariation?.startScore, gameDarts: [] };
        players.push(joiner);
        let gameState = { ...this.state.gameState };
        gameState.players = players;
        gameState.activePlayer = { index: 0, id: this.user.id };
        gameState.isWaitingForPlayers = false;
        this.setState({ gameState });
    }

    // If hosting
    async sendGameToServer() {
        if (this.gameStatus !== Models.GameStatuses.StartedOnline) return;

        let data = {
            gameTypeId: this.state.gameState.gameOptions?.gameVariation?.gameTypeId,
            gameVariationId: this.state.gameState.gameOptions?.gameVariation?.id,
            createdByUserId: this.user.id,
            status: "Lobby",
        };
        
        try {
            let gameId = await this.gameService.postNewGame(this.user, data);
            if (gameId) {
                let gameState = { ...this.state.gameState };
                gameState.gameId = gameId;
                this.setState({ gameState });
                this.serverComm.addGameToLobby(JSON.stringify(data));
                this.serverComm.joinGame(gameId.toString(), this.user.id.toString());
            }
        } catch (error) {
            alert (error);
        } 
    }


    
    handlePlayerAction(playerAction: Models.PlayerAction, actionSource: Models.PlayerActionSource = Models.PlayerActionSource.local) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (actionSource === Models.PlayerActionSource.local && (this.state.gameState.activePlayer.id !== this.user.id || this.state.gameState.isTransitioning)) {
            return;
        } else if (actionSource === Models.PlayerActionSource.remote && this.state.gameState.activePlayer.id != playerAction.player.id) {
                   return;
               }
        
        if (playerAction.type === Models.PlayerActionType.endTurn) {
            this.handleEndTurn(true);
        }

        if (playerAction.type === Models.PlayerActionType.throwDart) {
            this.handleThrowDart(playerAction.dart);
            // Moved handleEndTurn to a callback inside setState inside handleThrowDart
            // because the async setState wasn't updating state in time to get new values
            // this.handleEndTurn(false);
        }

        // Only send to server if it wasn't an action received from the server
        if (actionSource === Models.PlayerActionSource.local) {
            this.serverComm.sendPlayerAction(this.state.gameState.gameId, JSON.stringify(playerAction));
        }
    }

    handlePlayerActionSent(gameId: any, playerAction: string) {
        let objPlayerAction: Models.PlayerAction = JSON.parse(playerAction);
        console.log("game handlePlayerActionSent: " + JSON.stringify(objPlayerAction));
        this.handlePlayerAction(objPlayerAction, Models.PlayerActionSource.remote);
    }

    handleThrowDart(dart: Models.Dart) {
        this.dartSound.play();

        this.addRoundDart(dart);
        let dartValue = dart.mark * dart.multiplier;
        let newTurnScore;
        let gameState = { ...this.state.gameState };

        if (this.state.gameState.turnScore) {
            newTurnScore = this.state.gameState.turnScore - dartValue;
            gameState.turnScore = newTurnScore;
        }

        if (newTurnScore) {
            // Check for bust
            if (newTurnScore < 0) {
                this.handleBust();
            }
            // Check for win condition
            else if (newTurnScore === 0) {
                this.setState({ gameState }, () => {
                    this.handleWinGame();
                });
            }
            // End turn
            else {
                this.setState({ gameState }, () => {
                    this.handleEndTurn(false);
                });
            }
        }
    }

    addRoundDart(dart: any) {
        throw new Error("Method not implemented.");
    }

    handleBust() {
        throw new Error("Method not implemented.");
        /*
        this.setState({
            transitionLabel: "Bust!  Next Player Is Up",
            transitioning: true
        });

        setTimeout(() => {
            this.changeActivePlayer();
            this.setState({
                isTransitioning: false,
                turnScore: this.state.gameState.players[this.state.gameState.activePlayer.index].score,
                turnDarts: [],
            });
        }, 3000);
        */
    }

    changeActivePlayer() {
        throw new Error("Method not implemented.");
    }



    handleWinGame() {
        throw new Error("Method not implemented.");
        /*
        let playerName = this.state.gameState.players[this.state.gameState.activePlayer.index].name;
        this.setState({
            transitionLabel: `${playerName} Wins!!!`,
            isTransitioning: true
        });
        */
    }

    handleEndTurn(force: boolean) {
        /*
        if (force || this.state.gameState.turnDarts.length === 3) {
            
            let nextPlayerName = this.state.gameState.players[this.nextPlayerIndex()].name;
            this.setState({
                transitionLabel: `End of Turn - ${nextPlayerName} Is Up`,
                transitioning: true
            });

            let newPlayers = this.state.gameState.players;
            let newActivePlayer = newPlayers[this.state.gameState.activePlayer.index];
            newActivePlayer.score = this.state.gameState.turnScore;
            newPlayers[this.state.gameState.activePlayer.index] = newActivePlayer;

            setTimeout(() => {
                this.changeActivePlayer();
                this.setState({
                    isTransitioning: false,
                    turnDarts: [],
                    turnScore: this.state.gameState.players[this.state.gameState.activePlayer.index].score,
                    players: newPlayers
                });
            }, 3000);
        }
        */
    }

    render() {
        if (this.state.gameState.isWaitingForPlayers) {
            return <div className="game-controller">WAITING FOR PLAYER TO JOIN</div>;
        } else {
            return (
                <div className="game-controller">
                    <div className="header">
                        <DebugThrowDart
                            label="Single 10"
                            value="35-45"
                            user={this.user}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 20"
                            value="39-28"
                            user={this.user}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 7"
                            value="39-25"
                            user={this.user}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></DebugThrowDart>
                        <BoardController
                            user={this.user}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></BoardController>
                    </div>

                    <div className="main-area">
                        {this.state.gameState.isTransitioning && <Transition label={this.state.gameState.transitionLabel}></Transition>}

                        {this.state.gameState.players[this.state.gameState.activePlayer.index] && (
                            <CenterScore
                                name={this.state.gameState.players[this.state.gameState.activePlayer.index].name}
                                score={this.state.gameState.turnScore}></CenterScore>
                        )}
                    </div>

                    <div className="user-area">
                        {this.state.gameState.players && (
                            <PlayerScore
                                name={this.state.gameState.players[0].name}
                                score={this.state.gameState.players[0].score}></PlayerScore>
                        )}

                        <EndTurnButton
                            user={this.user}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></EndTurnButton>

                        {this.state.gameState.players && (
                            <PlayerScore
                                name={this.state.gameState.players[1].name}
                                score={this.state.gameState.players[1].score}></PlayerScore>
                        )}
                    </div>

                    <div className="footer">
                        <DartIndicator dartSeq="0" turnDarts={this.state.gameState.turnDarts}></DartIndicator>
                        <DartIndicator dartSeq="1" turnDarts={this.state.gameState.turnDarts}></DartIndicator>
                        <DartIndicator dartSeq="2" turnDarts={this.state.gameState.turnDarts}></DartIndicator>
                    </div>
                </div>
            );
        }
    }
}
