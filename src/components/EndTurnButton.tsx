import React, { Component } from 'react';
import './EndTurnButton.scss';
import * as Models from '../models/gameModels';

interface EndTurnButtonProps {
    user: Models.User,
    players: Array<Models.Player>,
    handlePlayerAction: Function
}

export default class EndTurnButton extends Component<EndTurnButtonProps, any> {
    constructor(props: EndTurnButtonProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        let playerIndex = this.props.players.findIndex(p => p.id === this.props.user.id);
        let playerThrowing = this.props.players[playerIndex];
        let playerAction: Models.PlayerAction = {
            player: playerThrowing,
            source: Models.PlayerActionSource.local,
            type: Models.PlayerActionType.endTurn,
            dart: {mark: 0, multiplier: 0, value: 0, display: ''}
        };

        this.props.handlePlayerAction(playerAction);
    }


    render() {
        return (
            <div>
                <button className="end-turn-button" onClick={this.handleClick}>
                    End Turn
                </button>
            </div>
        );
    }
}
