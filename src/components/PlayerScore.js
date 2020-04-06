import React, { Component } from 'react';
import './PlayerScore.scss';

export default class PlayerScore extends Component {

    render() {
        return (
            <div>
                <div className="player-score__name">{this.props.name}</div>
                
                <div className="player-score">
                    <div className="player-score__value">{this.props.score}</div>
                </div>
            </div>
        );
    }
}
