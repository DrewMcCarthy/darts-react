import React, { Component, MouseEvent } from 'react';
import './DebugThrowDart.scss';
import dartMap from "../libs/game_rules/dartMap";
import * as Models from '../models/gameModels';

interface DebugThrowDartProps {
    label: string,
    value: string,
    user: Models.User,
    players: Array<Models.Player>,
    handlePlayerAction: Function
}

export default class DebugThrowDart extends Component<DebugThrowDartProps,any> {
    constructor(props: DebugThrowDartProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event: MouseEvent) {
        let boardCoords = this.props.value;

        console.log("boardCoords: " + boardCoords);
        console.log("dartMap: " + dartMap(boardCoords).mark + " " + dartMap(boardCoords).multiplier);

        let playerIndex = this.props.players.findIndex(p => p.id === this.props.user.id);
        let playerThrowing = this.props.players[playerIndex];
        let dart: Models.Dart = dartMap(boardCoords);
        let playerAction: Models.PlayerAction = {
            player: playerThrowing,
            source: Models.PlayerActionSource.local,
            type: Models.PlayerActionType.throwDart,
            dart: dart
        };
        console.log("playerAction: " + JSON.stringify(playerAction));
        this.props.handlePlayerAction(playerAction);
    }

    render() {
        return (
            <div>
                <button onClick={this.handleClick} className="btn-debug">
                    {this.props.label}
                </button>
            </div>
        );
    }
}
