import React, { Component } from 'react';
import './Lobby.scss';
import LobbyService from '../services/LobbyService';


export default class Lobby extends Component {
    constructor(props) {
        super(props);
        // props
        this.user = this.props.user;
        this.serverComm = this.props.serverComm;
        this.appJoinGame = this.props.handleJoinGame;
        this.appSetScreen = this.props.handleSetScreen;

        this.lobbyService = new LobbyService();
        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.handleAddGameToLobby = this.handleAddGameToLobby.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.serverComm.sendToAllCallback = this.handleServerMessage;
        this.serverComm.addGameToLobbyCallback = this.handleAddGameToLobby;
        this.state = {
            games: null
        }
    }

    async componentDidMount() {
        await this.getGames();
        this.serverComm.joinLobby();
    }

    async componentWillUnmount() {
        console.log("Lobby unmounting");
    }

    async getGames() {
        try {
            let games = await this.lobbyService.getGames(this.user);
            if (games) this.setState({ games });
        } catch (error) {
            alert(error);
        }
    }

    async handleServerMessage(receivedMessage) {
        console.log(receivedMessage);
    }
    
    // Refresh list of games after receiving message that a game was added
    async handleAddGameToLobby(lobbyGame) {
        console.log(lobbyGame);
        await this.getGames();
    }

    async joinGame(gameId) {
        this.serverComm.joinGame(gameId.toString(), this.user.id.toString(), this.user.username);
        this.appJoinGame(gameId);
    }

    render() {
        if (this.state.games !== null) {
            return (
                <div className="lobby-container">
                    <div className="lobby-games">
                        <button key="999" name="return" className="lobby__btn" onClick={() => this.appSetScreen("Menu")}>
                            Return
                        </button>
                        
                        {this.state.games.map((g, i) => (
                            <div key={g.Id} className="lobby-game" onClick={() => this.joinGame(g.Id)}>
                                <input name="gameId" type="hidden" value={g.Id}></input>
                                <p className="game-detail">{`Type: ${g.GameType}`}</p>
                                <span className="game-detail">{`Variation: ${g.GameVariation}`}</span>
                                <p className="game-detail">{`Hosted By: ${g.CreatedBy}`}</p>
                                <p className="game-detail">
                                    {`Created ${Math.floor(
                                        (Date.now() - new Date(g.CreatedTimestamp)) / 1000 / 60
                                    )} minutes ago`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        else {
            return (
                <div></div>
            );
        }
    }
}
