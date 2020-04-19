import React, { Component } from 'react'
import './Menu.scss';
import Lobby from './Lobby';
import { api_url } from "../utils";


export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.handleGameHost = this.handleGameHost.bind(this);
        this.handleGameType = this.handleGameType.bind(this);
        this.handleGameVariation = this.handleGameVariation.bind(this);
        this.handleInOut = this.handleInOut.bind(this);
        this.handleReturn = this.handleReturn.bind(this);
        this.setSelectedOptions = this.setSelectedOptions.bind(this);
        this.state = {
            availableOptions: null,
            selectedOptions: {
                host: null,
                type: null,
                variation: null,
                inOut: null
            }
        };
    }

    componentDidMount() {
        this.getGameOptions();
    }

    setSelectedOptions(selectedOptions) {
        this.setState({ selectedOptions }, () => {
            // Use in callback to lift state to parent
            this.props.handleSelectedOptions(this.state.selectedOptions);
        });
    }

    handleReturn(event) {
        let selectedOptions = { ...this.state.selectedOptions };
        selectedOptions[event.target.id] = null;
        this.setSelectedOptions(selectedOptions);
    }

    handleGameHost(event) {
        let selectedOptions = {...this.state.selectedOptions}
        selectedOptions.host = event.target.value;
        this.setSelectedOptions(selectedOptions);
    }

    handleGameType(type) {
        let selectedOptions = {...this.state.selectedOptions}
        selectedOptions.type = type;
        this.setSelectedOptions(selectedOptions);
    }

    handleGameVariation(variation) {
        let selectedOptions = { ...this.state.selectedOptions };
        selectedOptions.variation = variation;
        this.setSelectedOptions(selectedOptions);
    }

    handleInOut(event) {
        let inOut = event.target.value;
        let selectedOptions = { ...this.state.selectedOptions };
        selectedOptions.inOut = inOut;
        this.setSelectedOptions(selectedOptions);
    }

    async getGameOptions() {
        let response = await fetch(`${api_url()}/options`, {
        method: "get",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + this.props.user.JwtToken 
        }
        });
        let availableOptions = await response.json();
        this.setState({ availableOptions });
    }

    gameHostButtons() {
        return (
            <div className="btn-container">
                <button className="menu__btn" value="Lobby" onClick={() => this.props.handleSetScreen("Lobby")}>
                    Join Online
                </button>
                <button className="menu__btn" value="NewOnline" onClick={e => this.handleGameHost(e)}>
                    Host Online
                </button>
                <button className="menu__btn" value="Local" onClick={e => this.handleGameHost(e)}>
                    Local Play
                </button>
            </div>
        );
    }

    gameTypeButtons() {
        var buttonArray = [];
        var typeButtons = this.state.availableOptions.GameTypes.map(gt => (
            <button key={gt.Id} className="menu__btn" onClick={() => this.handleGameType(gt)}>
                {`${gt.Name} Games`}
            </button>
        ));
        var returnButton = 
            <button key="999" id="host" className="menu__btn" onClick={e => this.handleReturn(e)}>
                Return
            </button>
        buttonArray.push(typeButtons, returnButton);
        return buttonArray;
    }

    gameVariationButtons() { 
        var buttonArray = [];
        var variationButtons = this.state.availableOptions.GameVariations
            .filter((gv) => { return gv.GameTypeId === this.state.selectedOptions.type.Id })
            .map(gv => (
                <button key={gv.Id} className="menu__btn" onClick={() => this.handleGameVariation(gv)}>
                    {gv.Name}
                </button>
            ));
        var returnButton = 
            <button key="999" id="type" className="menu__btn" onClick={e => this.handleReturn(e)}>
                Return
            </button>

        buttonArray.push(variationButtons, returnButton);
        return buttonArray;
    }

    render() {
        let buttons;
        // Game host buttons
        if (this.state.selectedOptions.host === null) {
            buttons = this.gameHostButtons();
        }
        else if (this.state.selectedOptions.host === "Lobby") {
            return (
                <Lobby user={this.props.user}></Lobby>
            );
        }
        // Game type buttons
        else if (this.state.selectedOptions.type === null && this.state.availableOptions !== null) {
            buttons = this.gameTypeButtons();
        }
        // Game variations
        else if (this.state.selectedOptions.variation === null && this.state.availableOptions !== null) {
            buttons = this.gameVariationButtons();
        }
        // 01 options
        else if (this.state.selectedOptions.inOut === null && this.state.availableOptions !== null) {
            buttons = (
                <div className="btn-container">
                    <button value="openOpen" className="menu__btn" onClick={e => this.handleInOut(e)}>
                        Open In/Open Out
                    </button>
                    <button value="openDouble" className="menu__btn" onClick={e => this.handleInOut(e)}>
                        Open In/Double Out
                    </button>
                    <button id="variation" className="menu__btn" onClick={e => this.handleReturn(e)}>
                        Return
                    </button>
                </div>
            );
        }

        return (
            <div className="menu">
                <div className="btn-container">
                    {buttons}
                </div>
            </div>
        );
    }
}
