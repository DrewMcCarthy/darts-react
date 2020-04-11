import React, { Component } from 'react'
import './Menu.scss';

export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.handleGameType = this.handleGameType.bind(this);
        this.handleStartScore = this.handleStartScore.bind(this);
        this.handleInOut = this.handleInOut.bind(this);
        this.handleReturn = this.handleReturn.bind(this);
        this.state = {
            availableOptions: null,
            selectedOptions: null,
            type: null,
            variation: null,
            startScore: null,
            inOut: null
        }
    }

    componentDidMount() {
        this.getGameOptions();
    }

    handleReturn(event) {
        this.setState({ [event.target.id]: null });
    }

    handleGameType(event) {
        let type = event.target.value;
        this.setState({ type });
    }

    handleStartScore(event) {
        let startScore = event.target.value;
        this.setState({ startScore });
    }

    handleInOut(event) {
        let inOut = event.target.value;
        this.setState({ inOut }, () => {
            // Use in callback after last option setting to lift state to parent
            this.props.handleOptionSelection(this.state);
        });
    }

    async getGameOptions() {
        let response = await fetch('https://localhost:5001/darts/options', {
        method: "get",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + this.props.JwtToken 
        }
        });
        let availableOptions = await response.json();
        this.setState({ availableOptions });
    }

    render() {
        let buttons;
        // Game type buttons
        if (this.state.type === null) {
            buttons = (
                <div className="btn-container">
                    <button value="zeroOne" className="menu__btn" onClick={e => this.handleGameType(e)}>
                        01 Games
                    </button>
                </div>
            );
        }
        // 01 variations
        else if (this.state.startScore === null) {
            buttons = (
                <div className="btn-container">
                    <button value="301" className="menu__btn" onClick={e => this.handleStartScore(e)}>
                        301
                    </button>
                    <button value="501" className="menu__btn" onClick={e => this.handleStartScore(e)}>
                        501
                    </button>
                    <button id="type" className="menu__btn" onClick={e => this.handleReturn(e)}>
                        Return
                    </button>
                </div>
            );
        }
        // 01 options
        else if (this.state.inOut === null) {
            buttons = (
                <div className="btn-container">
                    <button value="openOpen" className="menu__btn" onClick={e => this.handleInOut(e)}>
                        Open In/Open Out
                    </button>
                    <button value="openDouble" className="menu__btn" onClick={e => this.handleInOut(e)}>
                        Open In/Double Out
                    </button>
                    <button id="startScore" className="menu__btn" onClick={e => this.handleReturn(e)}>
                        Return
                    </button>
                </div>
            );
        }

        return (
            <div className="menu">
                {buttons}
            </div>
        );
    }
}
