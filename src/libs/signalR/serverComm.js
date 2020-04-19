import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { hub_url } from '../../utils';

export class ServerComm {
    constructor(sendToAllCallback = null, addGameToLobbyCallback = null, joinGameCallback = null, sendPlayerActionCallback = null) {
        this.username = null;
        this.sendToAllCallback = sendToAllCallback;
        this.addGameToLobbyCallback = addGameToLobbyCallback;
        this.joinGameCallback = joinGameCallback;
        this.sendPlayerActionCallback = sendPlayerActionCallback;
        this.hubConnected = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.setupHub = this.setupHub.bind(this);
        this.setupHub();
    }

    stop() {
        this.hubConnection.stop();
        this.sendToAllCallback = null;
        this.addGameToLobbyCallback = null;
        this.joinGameCallback = null;
        this.sendPlayerActionCallback = null;
    }
    
    setupHub() {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${ hub_url() }`)
            .configureLogging(LogLevel.Trace)
            .build();

        // The first parameter to on() must match a method name on the server
        this.hubConnection.on("sendToAll", (username, receivedMessage) => {
            this.sendToAllCallback(receivedMessage);
        });
        this.hubConnection.on("addGameToLobby", (lobbyGame) => {
            this.addGameToLobbyCallback(lobbyGame);
        });
        this.hubConnection.on("joinGame", (userId, username) => {
            this.joinGameCallback(userId, username);
        });
        this.hubConnection.on("sendPlayerAction", (gameId, playerAction) => {
            this.sendPlayerActionCallback(gameId, playerAction);
        });

        this.hubConnected = this.hubConnection.start().catch(e => console.log(e));
    }

    sendMessage(username, message) {
        this.hubConnected.then(() => {
            this.hubConnection
                .invoke("sendToAll", username, message)
                .catch(err => console.log(err));
        });
    }

    joinLobby() {
        this.hubConnected.then(() => {
            this.hubConnection.invoke("joinLobby").catch(err => console.log(err));
        });
    }
    

    addGameToLobby(lobbyGame) {
        this.hubConnected.then(() => {
            this.hubConnection.invoke("addGameToLobby", lobbyGame).catch(err => console.log(err));
        });
    }

    joinGame(gameId, userId, username) {
        this.hubConnected.then(() => {
            this.hubConnection.invoke("joinGame", gameId, userId, username).catch(err => console.log(err));
        });
    }

    sendPlayerAction(gameId, playerAction) {
        this.hubConnected.then(() => {
            this.hubConnection.invoke("sendPlayerAction", gameId, playerAction).catch(err => console.log(err));
        });
    }
}
