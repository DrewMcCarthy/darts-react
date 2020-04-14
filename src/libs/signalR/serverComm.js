import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export class ServerComm {
    constructor(sendToAllCallback = null, addGameToLobbyCallback = null, joinGameCallback = null) {
        this.username = null;
        this.sendToAllCallback = sendToAllCallback;
        this.addGameToLobbyCallback = addGameToLobbyCallback;
        this.joinGameCallback = joinGameCallback;
        this.hubConnected = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.setupHub = this.setupHub.bind(this);
        this.setupHub();
    }
    
    setupHub() {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5001/dartsHub")
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
}
