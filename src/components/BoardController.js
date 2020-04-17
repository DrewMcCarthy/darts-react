import React, { Component } from 'react';
import "./BoardController.scss";
import dartMap from "../libs/game_rules/dartMap";

export default class BoardController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boardConnected: false
        }

        this.handleNotifications = this.handleNotifications.bind(this);
        this.connectToBoard = this.connectToBoard.bind(this);

    }

    // componentDidMount() {
    //     this.connectToBoard();
    // }

    connectToBoard() {
        let serviceUuid = parseInt("0xFFE0");
        let characteristicUuid = parseInt("0xFFE1");

        console.log("Requesting Bluetooth Device...");
        navigator.bluetooth
            .requestDevice({ filters: [{ services: [serviceUuid] }] })
            .then(device => {
                console.log("Connecting to GATT Server...");
                return device.gatt.connect();
            })
            .then(server => {
                console.log("Getting Service...");
                return server.getPrimaryService(serviceUuid);
            })
            .then(service => {
                console.log("Getting Characteristic...");
                return service.getCharacteristic(characteristicUuid);
            })
            .then(characteristic => {
                this.myCharacteristic = characteristic;
                return this.myCharacteristic.startNotifications().then(_ => {
                    this.setState({ boardConnected: true });
                    console.log("> Notifications started");
                    this.myCharacteristic.addEventListener("characteristicvaluechanged", this.handleNotifications);
                });
            })
            .catch(error => {
                this.setState({ boardConnected: false });
                console.log("Argh! " + error);
            });
    }

    disconnectFromBoard() {
        if (this.myCharacteristic) {
            this.myCharacteristic
                .stopNotifications()
                .then(_ => {
                    console.log("> Notifications stopped");
                    this.myCharacteristic.removeEventListener("characteristicvaluechanged", this.handleNotifications);
                })
                .catch(error => {
                    console.log("Argh! " + error);
                });
        }
    }

    handleNotifications(event) {
        let bleBytes = event.target.value;
        let boardCoords = "";

        for (let i = 0; i < bleBytes.byteLength; i++) {
            let hexDart = "0x" + ("00" + bleBytes.getUint8(i).toString(16)).slice(-2);
            boardCoords += String.fromCharCode(hexDart);
        }

        console.log("boardCoords: " + boardCoords);
        console.log("dartMap: " + dartMap(boardCoords).mark + " " + dartMap(boardCoords).multiplier);

        let dart = dartMap(boardCoords);
        let playerAction = {
            player: { id: this.props.user.Id, name: this.props.user.Username },
            type: "throwDart",
            action: {dart: dart}
        }
        console.log("playerAction: " + JSON.stringify(playerAction));
        this.props.handlePlayerAction(playerAction);
    }

    render() {
        return (
            <div className="board-indicator">
                <span className="header__playerName">Drew</span>
                <div className={`connection-indicator ${this.state.boardConnected ? "active" : "inactive animated heartBeat infinite"}`}
                    onClick={this.connectToBoard}></div>
                {/* <div>
                    {this.state.dartsThrown.map((dart, idx) => {
                        return <p key={idx}>{this.dartToString(dart)}</p>
                    })}
                </div> */}
            </div>
        );
    }
}
