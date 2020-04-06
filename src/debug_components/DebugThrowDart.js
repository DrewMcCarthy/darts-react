import React, { Component } from 'react';
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
            player: { name: "Drew", isActive: true, score: 88 },
            type: "throwDart",
            action: {dart: dart}
        }
        console.log("playerAction: " + JSON.stringify(playerAction));
        this.props.handlePlayerAction(playerAction);
    }

    render() {
        return (
            <div>
                <button onClick={this.handleClick}>
                    {this.props.label}
                </button>
            </div>
        );
    }
}
