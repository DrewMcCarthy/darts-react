import React, { Component } from 'react'
import './Menu.scss';
import MenuService from '../services/MenuService';


export default class Menu extends Component {
    constructor(props) {
        super(props);
        // props
        this.user = this.props.user;
        this.appSelectedOptions = this.props.handleSelectedOptions;
        this.appSetScreen = this.props.handleSetScreen;

        this.menuService = new MenuService();
        this.handleOptionSelected = this.handleOptionSelected.bind(this);
        this.handleReturn = this.handleReturn.bind(this);
        this.setSelectedOptions = this.setSelectedOptions.bind(this);
        this.state = {
            allOptions: null,
            selectedOptions: {
                host: null,
                type: null,
                variation: null,
                settings: null
            }
        };
    }

    async componentDidMount() {
        try {
            let allOptions = await this.menuService.getGameOptions(this.user);
            if (allOptions) {
                this.setState({ allOptions });
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    setSelectedOptions(selectedOptions) {
        this.setState({ selectedOptions }, () => {
            // Use in callback to lift state to parent
            this.appSelectedOptions(this.state.selectedOptions);
        });
    }

    handleReturn(event) {
        let selectedOptions = { ...this.state.selectedOptions };
        selectedOptions[event.target.name] = null;
        this.setSelectedOptions(selectedOptions);
    }

    handleOptionSelected(event, value = null) {
        let newVal = value ? value : event.target.value; 
        let selectedOptions = {...this.state.selectedOptions}
        selectedOptions[event.target.name] = newVal;
        this.setSelectedOptions(selectedOptions);
    }

    gameHostButtons() {
        return (
            <div className="btn-container">
                <button className="menu__btn" name="host" value="Lobby" onClick={() => this.appSetScreen("Lobby")}>
                    Join Online
                </button>
                <button
                    className="menu__btn"
                    name="host"
                    value="Online"
                    onClick={(e) => this.handleOptionSelected(e)}>
                    Host Online
                </button>
                <button className="menu__btn" name="host" value="Local" onClick={(e) => this.handleOptionSelected(e)}>
                    Local Play
                </button>
            </div>
        );
    }

    gameTypeButtons() {
        let buttonArray = [];
        let typeButtons = this.state.allOptions.GameTypes.map(gt => (
            <button key={gt.Id} className="menu__btn" name="type" value={gt} onClick={e => this.handleOptionSelected(e, gt)}>
                {`${gt.Name} Games`}
            </button>
        ));
        let returnButton = 
            <button key="999" name="host" className="menu__btn" onClick={e => this.handleReturn(e)}>
                Return
            </button>
        buttonArray.push(typeButtons, returnButton);
        return buttonArray;
    }

    gameVariationButtons() { 
        let buttonArray = [];
        let variationButtons = this.state.allOptions.GameVariations
            .filter((gv) => { return gv.GameTypeId === this.state.selectedOptions.type.Id })
            .map(gv => (
                <button key={gv.Id} className="menu__btn" name="variation" onClick={e => this.handleOptionSelected(e, gv)}>
                    {gv.Name}
                </button>
            ));
        let returnButton = 
            <button key="999" name="type" className="menu__btn" onClick={e => this.handleReturn(e)}>
                Return
            </button>

        buttonArray.push(variationButtons, returnButton);
        return buttonArray;
    }

    inOutButtons() {
        let buttonArray = [];
        let inOutBtns = this.state.allOptions.GameSettings
            .filter((gs) => { return gs.GameTypeId === this.state.selectedOptions.type.Id })
            .map(gs => (
                <button key={gs.Id} className="menu__btn" name="settings" onClick={e => this.handleOptionSelected(e, gs)}>
                    {gs.Name}
                </button>
            ));
        let returnButton = 
            <button key="999" name="variation" className="menu__btn" onClick={e => this.handleReturn(e)}>
                Return
            </button>
        buttonArray.push(inOutBtns, returnButton);
        return buttonArray;
    }

    render() {
        let buttons;

        // Game host buttons
        if (this.state.selectedOptions.host === null) {
            buttons = this.gameHostButtons();
        }

        // Game type buttons
        else if (this.state.selectedOptions.type === null && this.state.allOptions !== null) {
            buttons = this.gameTypeButtons();
        }

        // Game variations
        else if (this.state.selectedOptions.variation === null && this.state.allOptions !== null) {
            buttons = this.gameVariationButtons();
        }

        // 01 options
        else if (this.state.selectedOptions.settings === null && this.state.allOptions !== null) {
            buttons = this.inOutButtons();
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
