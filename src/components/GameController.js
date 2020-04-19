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
        this.handlePlayerActionSent = this.handlePlayerActionSent.bind(this);
        this.handleBust = this.handleBust.bind(this);
        this.initPlayers = this.initPlayers.bind(this);

        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
        this.serverComm = this.props.serverComm;
        this.serverComm.sendToAllCallback = this.handleServerMessage;
        this.serverComm.joinGameCallback = this.handlePlayerJoined;
        this.serverComm.sendPlayerActionCallback = this.handlePlayerActionSent;


        this.state = {
            gameId: null,
            selectedOptions: this.props.selectedOptions,
            players: [],
            activePlayer: {},
            winningPlayer: {},
            turnDarts: [],
            tempScore: 0,
            transitioning: false,
            transitionLabel: "",
            waitingForPlayers: true
        };
    }

    componentDidMount() {
        // Load sounds
        this.dartSound = new UIfx(process.env.PUBLIC_URL + "/audio/dartSound.mp3");

        if (this.props.gameStatus === "Started") {
            this.sendGameToServer();
            let tempScore = this.state.selectedOptions.variation.StartScore;
            let creator = { id: this.props.user.Id, name: this.props.user.Username, score: this.state.selectedOptions.variation.StartScore };
            let players = [creator];
            this.setState({ players, tempScore });
        }
        else if (this.props.gameStatus === "Joined") {
            this.initPlayers();
        }
    }

    async initPlayers() {
        if (this.props.gameStatus === "Joined") {
            await this.getGameInfo().then((gameInfo) => {
                    let creator = { id: gameInfo.CreatedByUserId, name: gameInfo.CreatedBy, score: gameInfo.StartScore };
                    let joiner = { id: this.props.user.Id, name: this.props.user.Username, score: gameInfo.StartScore };
                    let players = [creator, joiner];
                    this.setState({
                        gameId: this.props.gameId,
                        players,
                        waitingForPlayers: false,
                        activePlayer: { index: 0, id: creator.id },
                        tempScore: gameInfo.StartScore
                    });
                }, (error) => console.log(error));
        }
    }

    // If joining a game, get the settings and creator info
    async getGameInfo() {
        let response = await fetch(`${api_url()}/game/${this.props.gameId}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.props.user.JwtToken
            }
        });
        let gameInfo = await response.json();
        console.log("gameInfo: " + JSON.stringify(gameInfo));
        return gameInfo;
    }

    handleServerMessage(receivedMessage) {
        console.log(receivedMessage);
    }

    // If hosting, this is called when other players join
    handlePlayerJoined(userId, username) {
        console.log(`Player Joined - ID:${userId} - Name:${username}`);
        let players = [...this.state.players];
        let joiner = { id: userId, name: username, score: this.state.selectedOptions.variation.StartScore };
        players.push(joiner);
        this.setState({ players, activePlayer: { index: 0, id: this.props.user.Id }, waitingForPlayers: false });
    }

    // If hosting
    async sendGameToServer() {
        if (this.props.gameStatus !== "Started") return;

        let data = {
            "gameTypeId": this.state.selectedOptions.variation.GameTypeId,
            "gameVariationId": this.state.selectedOptions.variation.Id,
            "createdByUserId": this.props.user.Id,
            "status": "Lobby"
        };
        let response = await fetch(`${api_url()}/creategame`, {
            method: "post",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.props.user.JwtToken},
            body: JSON.stringify(data)
        });
        let gameId = await response.json();
        console.log("gameId: " + gameId);

        this.setState({ gameId });
        this.serverComm.addGameToLobby(JSON.stringify(data));
        this.serverComm.joinGame(gameId.toString(), this.props.user.Id.toString());
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
    
    handlePlayerAction(playerAction, actionSource = "local") {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (actionSource === "local" && (this.state.activePlayer.id !== this.props.user.Id || this.state.transitioning)) {
            return;
        }
        else if (actionSource === "remote" && this.state.activePlayer.id != playerAction.player.id) {
            return;
        }
        
        if (playerAction.type === "endTurn") {
            this.handleEndTurn(true);
        }

        if (playerAction.type === "throwDart") {
            this.handleThrowDart(playerAction.action.dart);
            // Moved handleEndTurn to a callback inside setState inside handleThrowDart
            // because the async setState wasn't updating state in time to get new values
            // this.handleEndTurn(false);
        }

        // Only send to server if it wasn't an action received from the server
        if (actionSource === "local") {
            this.serverComm.sendPlayerAction(this.state.gameId, JSON.stringify(playerAction));
        }
    }

    handlePlayerActionSent(gameId, playerAction) {
        console.log("game handlePlayerActionSent: " + JSON.parse(playerAction));
        this.handlePlayerAction(JSON.parse(playerAction), "remote");
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
        // Check for win condition
        else if (newTempScore === 0) {
            this.setState({ tempScore: newTempScore }, () => {
                this.handleWinGame();
            });
        }
        // End turn
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
        }, 3000);
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
        if (this.state.waitingForPlayers === true) {
            return (
                <div className="game-controller">WAITING FOR PLAYER TO JOIN</div>
            );
        }
        else {
            return (
                <div className="game-controller">
                    <div className="header">
                        <DebugThrowDart
                            label="Single 10"
                            value="35-45"
                            user={this.props.user}
                            handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 20"
                            value="39-28"
                            user={this.props.user}
                            handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                        <DebugThrowDart
                            label="Triple 7"
                            value="39-25"
                            user={this.props.user}
                            handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></DebugThrowDart>
                        <BoardController
                            user={this.props.user}
                            handlePlayerAction={playerAction =>
                                this.handlePlayerAction(playerAction)
                            }></BoardController>
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
                            user={this.props.user}
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
}
