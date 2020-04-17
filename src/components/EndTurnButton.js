import React, { Component } from 'react';
import './EndTurnButton.scss';

export default class EndTurnButton extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        let playerAction = {
            player: { id: this.props.user.Id, name: this.props.user.Username },
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
