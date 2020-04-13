import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export class ServerComm {
    constructor(callback) {
        this.username = null;
        this.callback = callback;
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

        // The first parameter to on() matches the name referenced on the server
        this.hubConnection.on("sendToAll", (username, receivedMessage) => {
            console.log(`username: ${username} - message: ${receivedMessage}`);
            this.callback(receivedMessage);
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
}
