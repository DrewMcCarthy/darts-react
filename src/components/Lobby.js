import React, { Component } from 'react';
import './Lobby.scss';
import { ServerComm } from '../libs/signalR/serverComm';

export default class Lobby extends Component {
    constructor(props) {
        super(props);
        this.handleServerMessage = this.handleServerMessage.bind(this);
        this.serverComm = new ServerComm(this.handleServerMessage);
        this.state = {
            games: null
        }
    }

    async componentDidMount() {
        let games = await this.getGames();
        this.setState({ games });
        console.log(JSON.stringify(games));
    }

    async getGames() {
        let response = await fetch("https://localhost:5001/darts/lobby", {
            method: "get",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.props.user.JwtToken
            }
        });
        let games = await response.json();
        return games;
    }

    handleServerMessage(receivedMessage) {
        console.log(receivedMessage);
    }

    render() {
        if (this.state.games !== null) {
            return (
                <div className="lobby-container">
                    <div className="lobby-games">
                        {this.state.games.map((g, i) => (
                            <div key={g.Id} className="lobby-game">
                                <input type="hidden" value={g.Id}></input>
                                <p className="game-detail">{`Type: ${g.GameType}`}</p>
                                <span className="game-detail">{`Variation: ${g.GameVariation}`}</span>
                                <p className="game-detail">{`Hosted By: ${g.CreatedBy}`}</p>
                                <p className="game-detail">
                                    {`Created ${Math.floor((Date.now() - new Date(g.CreatedTimestamp)) / 1000 / 60)} minutes ago`}
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
