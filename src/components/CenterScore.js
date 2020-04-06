import React, { Component } from 'react'
import './CenterScore.scss'

export default class CenterScore extends Component {

    render() {
        return (
            <div>
                <div className="center-score__name">{this.props.name}</div>
                <div className="center-score">
                    <div className="center-score__value">{this.props.score}</div>
                </div>
            </div>
        );
    }
}
