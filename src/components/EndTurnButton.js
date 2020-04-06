import React, { Component } from 'react';
import './EndTurnButton.scss';

export default class EndTurnButton extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        let playerAction = {
            player: { name: "Drew", isActive: true, score: 88 },
            type: "endTurn",
            action: {}
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
