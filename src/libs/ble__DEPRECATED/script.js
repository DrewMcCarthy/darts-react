import dartMap from '../game-rules/dartMap'

var myCharacteristic;
var boardConnected = false;

export function isBoardConnected() {
    return boardConnected;
}

export function onStartButtonClick() {
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
            myCharacteristic = characteristic;
            return myCharacteristic.startNotifications().then(_ => {
                boardConnected = true;
                console.log("> Notifications started");
                myCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);
            });
        })
        .catch(error => {
            boardConnected = false;
            console.log("Argh! " + error);
        });
}

export function onStopButtonClick() {
    if (myCharacteristic) {
        myCharacteristic
            .stopNotifications()
            .then(_ => {
                console.log("> Notifications stopped");
                myCharacteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
            })
            .catch(error => {
                console.log("Argh! " + error);
            });
    }
}

export function handleNotifications(event) {
    let value = event.target.value;
    let dartStr = "";

    for (let i = 0; i < value.byteLength; i++) {
        let hexDart = "0x" + ("00" + value.getUint8(i).toString(16)).slice(-2);
        dartStr += String.fromCharCode(hexDart);
    }

    console.log("dartStr: " + dartStr);
    console.log("dartMap: " + dartMap(dartStr).mark + " " + dartMap(dartStr).multiplier);
}

