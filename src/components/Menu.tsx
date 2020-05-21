import React, { Component } from 'react'
import './Menu.scss';
import * as Models from '../models/gameModels';
import MenuService from '../services/MenuService';

interface MenuProps {
    user: Models.User,
    handleGameOptions: Function,
    handleSetScreen: Function
}

interface MenuState {
    gameStatus: Models.GameStatuses | null,
    allOptions: Models.AllOptions | null,
    gameOptions: Models.GameOptions | null
}

export default class Menu extends Component<MenuProps, MenuState> {
    user: Models.User;
    appGameOptions: Function;
    appSetScreen: Function;
    menuService: MenuService;

    constructor(props: MenuProps) {
        super(props);
        // props
        this.user = this.props.user;
        this.appGameOptions = this.props.handleGameOptions;
        this.appSetScreen = this.props.handleSetScreen;

        this.menuService = new MenuService();
        this.handleOptionSelected = this.handleOptionSelected.bind(this);
        // this.handleReturn = this.handleReturn.bind(this);
        this.setGameOptions = this.setGameOptions.bind(this);
        this.state = {
            gameStatus: null,
            allOptions: null,
            gameOptions: {
                gameType: null,
                gameVariation: null,
                gameSetting: null
            }
        };
    }

    async componentDidMount() {
        if (this.user) {
            try {
                let allOptions = await this.menuService.getAllOptions(this.user);
                if (allOptions) {
                    this.setState({ allOptions });
                }
            } catch (error) {
                console.log(error);
                this.appSetScreen(Models.GameScreens.Login);
                //throw error;
            }
        }
    }

    setGameOptions(gameOptions: Models.GameOptions) {
        this.setState({ gameOptions }, () => {
            // Use in callback to lift state to parent
            this.appGameOptions(this.state.gameOptions, this.state.gameStatus);
        });
    }

    // handleReturn(event: React.MouseEvent<HTMLButtonElement>) {
    //     // Need to cast the spread operator
    //     let gameOptions: Models.GameOptions = {...this.state.gameOptions} as Models.GameOptions;
    //     let target = event.target as HTMLButtonElement;
    //     let optionName: string = target.name;
    //     gameOptions[optionName] = null;
    //     this.setGameOptions(gameOptions);
    // }

    returnToGameStatus() {
        this.setState({ gameStatus: null});
    }

    returnToGameType() {
        // Need to cast the spread operator
        let gameOptions: Models.GameOptions = { ...this.state.gameOptions } as Models.GameOptions;
        gameOptions.gameVariation = null;
        this.setState({ gameOptions })
    }

    returnToGameVariation() {
        // Need to cast the spread operator
        let gameOptions: Models.GameOptions = { ...this.state.gameOptions } as Models.GameOptions;
        gameOptions.gameSetting = null;
        this.setState({ gameOptions })
    }

    handleOptionSelected(event: React.MouseEvent<HTMLButtonElement>, value: any = null) {
        let target = event.target as HTMLButtonElement;
        let newVal = value ? value : target.value; 
        // Need to cast the spread operator
        let gameOptions: Models.GameOptions = { ...this.state.gameOptions } as Models.GameOptions;
        gameOptions[target.name] = newVal;
        this.setGameOptions(gameOptions);
    }

    handleGameStatusSelected(value: Models.GameStatuses) {
        let gameStatus = value;
        this.setState({ gameStatus });
    }

    gameStatusButtons() {
        return (
            <div className="btn-container">
                <button className="menu__btn" name="gameStatus" value="Lobby" onClick={() => this.appSetScreen(Models.GameScreens.Lobby)}>
                    Join Online
                </button>
                <button
                    className="menu__btn"
                    name="gameStatus"
                    value="StartedOnline"
                    onClick={() => this.handleGameStatusSelected(Models.GameStatuses.StartedOnline)}>
                    Host Online
                </button>
                <button className="menu__btn" name="gameStatus" value="StartedLocal" onClick={() => this.handleGameStatusSelected(Models.GameStatuses.StartedLocal)}>
                    Local Play
                </button>
            </div>
        );
    }

    gameTypeButtons() {
        let buttonArray = [];
        let typeButtons = this.state.allOptions?.gameTypes?.map(gt => (
            <button key={gt.id} className="menu__btn" name="gameType" onClick={e => this.handleOptionSelected(e, gt)}>
                {`${gt.name} Games`}
            </button>
        ));
        let returnButton = 
            <button key="999" name="gameStatus" className="menu__btn" onClick={() => this.returnToGameStatus()}>
                Return
            </button>
        buttonArray.push(typeButtons, returnButton);
        return buttonArray;
    }

    gameVariationButtons() { 
        let buttonArray = [];
        let variationButtons = this.state.allOptions?.gameVariations
            ?.filter((gv) => { return gv.gameTypeId === this.state.gameOptions?.gameType?.id })
            ?.map(gv => (
                <button key={gv.id} className="menu__btn" name="gameVariation" onClick={e => this.handleOptionSelected(e, gv)}>
                    {gv.name}
                </button>
            ));
        let returnButton = 
            <button key="999" name="gameType" className="menu__btn" onClick={() => this.returnToGameType()}>
                Return
            </button>

        buttonArray.push(variationButtons, returnButton);
        return buttonArray;
    }

    inOutButtons() {
        let buttonArray = [];
        let inOutBtns = this.state.allOptions?.gameSettings
            ?.filter((gs) => { return gs.gameTypeId === this.state.gameOptions?.gameType?.id })
            ?.map(gs => (
                <button key={gs.id} className="menu__btn" name="gameSetting" onClick={e => this.handleOptionSelected(e, gs)}>
                    {gs.name}
                </button>
            ));
        let returnButton = 
            <button key="999" name="gameVariation" className="menu__btn" onClick={() => this.returnToGameVariation()}>
                Return
            </button>
        buttonArray.push(inOutBtns, returnButton);
        return buttonArray;
    }

    render() {
        let buttons;

        // Game status buttons (host; how a game is started/joined)
        if (this.state.gameStatus === null) {
            buttons = this.gameStatusButtons();
        }

        // Game type buttons
        else if (this.state.gameOptions?.gameType === null && this.state.allOptions !== null) {
            buttons = this.gameTypeButtons();
        }

        // Game variations
        else if (this.state.gameOptions?.gameVariation === null && this.state.allOptions !== null) {
            buttons = this.gameVariationButtons();
        }

        // 01 options
        else if (this.state.gameOptions?.gameSetting === null && this.state.allOptions !== null) {
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
