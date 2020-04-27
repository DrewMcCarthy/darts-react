import React, { Component } from 'react'
import './DartIndicator.scss';

export default class DartIndicator extends Component {
    
    dartToString(dart) {
        let mark = dart.mark === 25 ? "Bullseye" : dart.mark;
        
        if ( dart.multiplier === 1 ) return "Single " + mark;
        if ( dart.multiplier === 2 ) return "Double " + mark;
        if ( dart.multiplier === 3 ) return "Triple " + mark;
    }

    render() {
        // The sequence number of this DartIndicator in the round
        // Used to retrieve correct dart from darts thrown this round
        let dartSeq = this.props.dartSeq;
        let dart = {};
        let dartIndicator;

        try {
            dart = this.props.turnDarts[dartSeq];
        } 
        catch {
            dart = {};
        }

        if (dart === undefined) {
            dartIndicator = (
                <img
                    src={process.env.PUBLIC_URL + "/images/dart_indicator_sm.png"}
                    className="dart-indicator__img"
                    alt="Dart"
                />
            );
        }
        else {
            dartIndicator = ( <div>{this.dartToString(dart)}</div> );
        }

        return (
            <div className="dart-indicator">
                {dartIndicator}
            </div>
        );
    }
}
