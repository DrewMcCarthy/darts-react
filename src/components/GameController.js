import React, { Component } from 'react'
import Start from "./Start";
import CenterScore from "./CenterScore";

export default class GameController extends Component {
    constructor() {
        super();
        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.state = {
            score: 501
        }
    }

    handlePlayerAction(playerAction) {
        console.log("playerAction: " + JSON.stringify(playerAction));

        if (!playerAction.player.isActive) return;

        if (playerAction.type === "throwDart") {
            var dart = playerAction.action.dart;
            var dartValue = dart.mark * dart.multiplier;
            this.setState({ score: this.state.score - dartValue });
        }
    }

    render() {
        return (
            <div id="game-controller">
                <div class="header">
                    <Start handlePlayerAction={playerAction => this.handlePlayerAction(playerAction)}></Start>
                </div>
                <div className="main-area">
                    <CenterScore score={this.state.score}></CenterScore>
                </div>
            </div>
        );
    }
}
