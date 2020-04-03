import React, { Component } from 'react';
import './Start.scss';
import dartMap from "../libs/game-rules/dartMap";

export default class Start extends Component {
    constructor() {
        super();
        var myCharacteristic;
        this.state = {
            boardConnected: false,
            dartsThrown: []
        }

        this.handleNotifications = this.handleNotifications.bind(this);
        this.addDart = this.addDart.bind(this);
    }

    dartToString(dart) {
        if ( dart.multiplier == 1 ) return "Single " + dart.mark;
        if ( dart.multiplier == 2 ) return "Double " + dart.mark;
        if ( dart.multiplier == 3 ) return "Triple " + dart.mark;
    }

    addDart(dart) {
        var newDartsThrown = this.state.dartsThrown;
        newDartsThrown.push(dart);
        this.setState({ dartsThrown: newDartsThrown });
    }

    onStartButtonClick() {
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

    onStopButtonClick() {
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

        this.addDart(dartMap(boardCoords));
    }

    render() {
        return (
            <div>
                <header>
                    <div className={`connection-indicator ${this.state.boardConnected ? "active" : "inactive"}`}></div>
                </header>
                <button className="btn" onClick={() => this.onStartButtonClick()}>
                    Connect to Dartboard
                </button>

                <div>
                    {this.state.dartsThrown.map(dart => {
                        return <p>{this.dartToString(dart)}</p>
                    })}
                </div>
            </div>
        );
    }
}
