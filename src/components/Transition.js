import React, { Component } from 'react';
import './Transition.scss';

export default class Transition extends Component {

    render() {
        return (
            <div className="transition animated slideInDown">
                {this.props.label}
            </div>
        );
    }
}
