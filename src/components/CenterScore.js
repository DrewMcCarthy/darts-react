import React, { Component } from 'react'
import './CenterScore.scss'

export default class CenterScore extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="center-score">
                <div className="center-score__value">{this.props.score}</div>
            </div>
        );
    }
}
