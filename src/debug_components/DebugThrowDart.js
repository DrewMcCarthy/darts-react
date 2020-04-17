import React, { Component } from 'react';
import './DebugThrowDart.scss';
import dartMap from "../libs/game-rules/dartMap";

export default class DebugThrowDart extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        let boardCoords = this.props.value;

        console.log("boardCoords: " + boardCoords);
        console.log("dartMap: " + dartMap(boardCoords).mark + " " + dartMap(boardCoords).multiplier);

        let dart = dartMap(boardCoords);
        let playerAction = {
            player: { id: this.props.user.Id, name: this.props.user.Username },
            type: "throwDart",
            action: { dart: dart }
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
