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
import { zeroOnePlayerAction } from '../libs/game_rules/zeroOne';
import { ServerComm } from '../libs/signalR/serverComm';
import GameSetupService from '../services/GameSetupService';

interface GameControllerProps {
    user: Models.User;
    serverComm: ServerComm,
    gameId: number,
    gameStatus: Models.GameStatuses | null,
    gameOptions: Models.GameOptions | null
}

export default class GameController extends Component<GameControllerProps, Models.GameState> {
    user: Models.User;
    serverComm: any;
    gameId: number;
    gameStatus: Models.GameStatuses | null;
    gameOptions: Models.GameOptions | null;
    gameService: GameService;
    dartSound: HTMLAudioElement;
    gameSetupService: GameSetupService;

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
        this.gameSetupService = new GameSetupService(this.gameService);

        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.handlePlayerActionSent = this.handlePlayerActionSent.bind(this);
        // this.initPlayers = this.initPlayers.bind(this);

        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
        
        this.serverComm.sendToAllCallback = this.handleServerMessage;
        this.serverComm.joinGameCallback = this.handlePlayerJoined;
        this.serverComm.sendPlayerActionCallback = this.handlePlayerActionSent;


        this.state = {
            gameId: this.props.gameId,
            gameOptions: this.gameOptions,
            activePlayer: {
                userId: 0,
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
        };
    }

    async componentDidMount() {
        await this.initGame();
    }

    initGame = async () => {
        let initState = await this.gameSetupService.initGame(this.state, this.gameStatus, this.user);
        this.setState({ ...initState }, () => {
            if (this.gameStatus === Models.GameStatuses.StartedOnline) {
                this.sendGameToServer();
            }
        });
    }

    handleServerMessage(receivedMessage: string) {
        console.log(receivedMessage);
    }

    // If hosting, this is called when other players join
    handlePlayerJoined(userId: number, username: string) {
        console.log(`Player Joined - ID:${userId} - Name:${username}`);
        let players = [...this.state.players];
        let joiner = { id: userId, name: username, score: this.state.gameOptions?.gameVariation?.startScore, gameDarts: [] };
        players.push(joiner);
        let gameState = { ...this.state };
        gameState.players = players;
        gameState.activePlayer = { index: 0, userId: this.user.id };
        gameState.isWaitingForPlayers = false;
        this.setState({ ...gameState });
    }

    // If hosting
    async sendGameToServer() {
        if (this.gameStatus !== Models.GameStatuses.StartedOnline) return;

        let data = {
            gameTypeId: this.state.gameOptions?.gameVariation?.gameTypeId,
            gameVariationId: this.state.gameOptions?.gameVariation?.id,
            gameSettingId: this.state.gameOptions?.gameSetting?.id,
            createdByUserId: this.user.id,
            status: "Lobby",
        };
        
        try {
            let gameId = await this.gameService.postNewGame(this.user, data);
            if (gameId) {
                let gameState = { ...this.state };
                gameState.gameId = gameId;
                this.setState({ ...gameState });
                this.serverComm.addGameToLobby(JSON.stringify(data));
                this.serverComm.joinGame(gameId, this.user.id);
            }
        } catch (error) {
            alert (error);
        } 
    }

    handlePlayerAction(playerAction: Models.PlayerAction) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        
        if (playerAction.player.id === this.state.activePlayer.userId) {
            // Only send to server if it wasn't an action received from the server
            if (playerAction.source === Models.PlayerActionSource.local) {
                this.serverComm.sendPlayerAction(this.state.gameId, JSON.stringify(playerAction));
            }

            let newGameState = zeroOnePlayerAction(this.state, playerAction);
            this.setState({ ...newGameState }, () => {
                if (this.state.isTransitioning) {
                    let turnScore = this.state.players[this.state.activePlayer.index].score;
                    setTimeout(() => {
                        this.setState({ isTransitioning: false, turnScore: turnScore ?? this.state.turnScore })
                    }, 3000);
                }
            });
        }
    }

    handlePlayerActionSent(gameId: any, playerAction: string) {
        let objPlayerAction: Models.PlayerAction = JSON.parse(playerAction);
        console.log("game handlePlayerActionSent: " + JSON.stringify(objPlayerAction));

        // Change action source to remote before processing
        objPlayerAction.source = Models.PlayerActionSource.remote;
        this.handlePlayerAction(objPlayerAction);
    }

    handleThrowDart(dart: Models.Dart) {
        this.dartSound.play();

        this.addRoundDart(dart);
        let dartValue = dart.mark * dart.multiplier;
        let newTurnScore;
        let gameState = { ...this.state };

        if (this.state.turnScore) {
            newTurnScore = this.state.turnScore - dartValue;
            gameState.turnScore = newTurnScore;
        }

        if (newTurnScore) {
            // Check for bust
            if (newTurnScore < 0) {
                this.handleBust();
            }
            // Check for win condition
            else if (newTurnScore === 0) {
                this.setState({ ...gameState }, () => {
                    this.handleWinGame();
                });
            }
            // End turn
            else {
                this.setState({ ...gameState }, () => {
                    this.handleEndTurn(false);
                });
            }
        }
    }

    addRoundDart(dart: any) {
        this.state.players[this.state.activePlayer.index].gameDarts.push(dart);
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
                turnScore: this.state.players[this.state.activePlayer.index].score,
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
        let playerName = this.state.players[this.state.activePlayer.index].name;
        this.setState({
            transitionLabel: `${playerName} Wins!!!`,
            isTransitioning: true
        });
        */
    }

    handleEndTurn(force: boolean) {
        /*
        if (force || this.state.turnDarts.length === 3) {
            
            let nextPlayerName = this.state.players[this.nextPlayerIndex()].name;
            this.setState({
                transitionLabel: `End of Turn - ${nextPlayerName} Is Up`,
                transitioning: true
            });

            let newPlayers = this.state.players;
            let newActivePlayer = newPlayers[this.state.activePlayer.index];
            newActivePlayer.score = this.state.turnScore;
            newPlayers[this.state.activePlayer.index] = newActivePlayer;

            setTimeout(() => {
                this.changeActivePlayer();
                this.setState({
                    isTransitioning: false,
                    turnDarts: [],
                    turnScore: this.state.players[this.state.activePlayer.index].score,
                    players: newPlayers
                });
            }, 3000);
        }
        */
    }

    render() {
        if (this.state.isWaitingForPlayers) {
            return <div className="game-controller">WAITING FOR PLAYER TO JOIN</div>;
        } else {
            return (
                <div className="game-controller">
                    <div className="header">
                        <DebugThrowDart
                            label="Single 10"
                            value="35-45"
                            user={this.user}
                            players={this.state.players}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 20"
                            value="39-28"
                            user={this.user}
                            players={this.state.players}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 7"
                            value="39-25"
                            user={this.user}
                            players={this.state.players}
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
                        {this.state.isTransitioning && <Transition label={this.state.transitionLabel}></Transition>}

                        {this.state.players[this.state.activePlayer.index] && (
                            <CenterScore
                                name={this.state.players[this.state.activePlayer.index].name}
                                score={this.state.turnScore}></CenterScore>
                        )}
                    </div>

                    <div className="user-area">
                        {this.state.players && (
                            <PlayerScore
                                name={this.state.players[0].name}
                                score={this.state.players[0].score}></PlayerScore>
                        )}

                        <EndTurnButton
                            user={this.user}
                            players={this.state.players}
                            handlePlayerAction={(playerAction: Models.PlayerAction) =>
                                this.handlePlayerAction(playerAction)
                            }></EndTurnButton>

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
}
