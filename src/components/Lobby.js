import React, { Component } from 'react';
import './Lobby.scss';


export default class Lobby extends Component {
    constructor(props) {
        super(props);
        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.handleAddGameToLobby = this.handleAddGameToLobby.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.serverComm = this.props.serverComm;
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

    componentWillUnmount() {
        console.log("Lobby unmounting");
    }

    async getGames() {
        let response = await fetch(`${api_url()}/lobby`, {
            method: "get",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.props.user.JwtToken
            }
        });
        let games = await response.json();
        this.setState({ games });
    }

    handleServerMessage(receivedMessage) {
        console.log(receivedMessage);
    }
    
    // Refresh list of games after receiving message that a game was added
    async handleAddGameToLobby(lobbyGame) {
        console.log(lobbyGame);
        await this.getGames();
    }

    async joinGame(gameId) {
        this.serverComm.joinGame(gameId.toString(), this.props.user.Id.toString(), this.props.user.Username);
        this.props.handleJoinGame(gameId);
    }

    render() {
        if (this.state.games !== null) {
            return (
                <div className="lobby-container">
                    <div className="lobby-games">
                        {this.state.games.map((g, i) => (
                            <div key={g.Id} className="lobby-game" onClick={() => this.joinGame(g.Id)}>
                                <input name="gameId" type="hidden" value={g.Id}></input>
                                {/* <input name="createdByUserId" type="hidden" value={g.CreatedByUserId}></input> */}
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
