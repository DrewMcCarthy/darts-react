import React, { Component } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export default class ServerComm extends Component {
    constructor(props) {
        super(props);
        this.setupHub = this.setupHub.bind(this);
        this.onChangeUser = this.onChangeUser.bind(this);
        this.onChangeMessage = this.onChangeMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.state = {
            username: '',
            message: '',
            messages: [],
            hubConnection: null
        };
    }

    setupHub() {
        let hubConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5001/dartsHub")
            .configureLogging(LogLevel.Information)
            .build();

        this.setState({ hubConnection }, () => {
            this.state.hubConnection.start();

            // The first parameter to on() matches the name referenced on the server
            this.state.hubConnection.on('sendToAll', (username, receivedMessage) => {
                let text = `${username}: ${receivedMessage}`;
                let messages = this.state.messages.concat([text]);
                this.setState({ messages });
                console.log("messages: " + messages);
            });
        });
    }

    onChangeUser(event) {
        let username = event.target.value;
        this.setState({ username });
    }

    onChangeMessage(event) {
        let message = event.target.value;
        this.setState({ message });
    }

    sendMessage() {
        this.state.hubConnection
            .invoke('sendToAll', this.state.username, this.state.message)
            .catch(err => console.log(err));

        this.setState({ message: '' });
    }

    render() {
        return (
            <div>
                {null}
                {/* <div className="servercomm">
                    <input name="username" placeholder="Username" onChange={e => this.onChangeUser(e)}></input>
                    <input name="message" onChange={e => this.onChangeMessage(e)}></input>
                    <button onClick={this.sendMessage}>Send</button>
                    <button onClick={this.setupHub}>Setup Hub</button>
                    {this.state.messages.map((m, idx) => (
                        <p key={idx}>{ m }</p>
                    ))}
                </div> */}
            </div>
        );
    }
}
