import React, { Component } from 'react';
import './Login.scss';
import { api_url } from '../utils';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.authenticate = this.authenticate.bind(this);
        this.register = this.register.bind(this);
        this.state = {
            email: null,
            username: null,
            password: null,
            isRegistering: false
        }
    }

    onChangeEmail(event) {
        let email = event.target.value;
        this.setState({ email });
    }

    onChangePassword(event) {
        let password = event.target.value;
        this.setState({ password });
    }

    onChangeUsername(event) {
        let username = event.target.value;
        this.setState({ username });
    }

    async authenticate() {
        let response = await fetch(`${api_url()}/authenticate`, {
            method: "post",
            body: JSON.stringify({ email: this.state.email, password: this.state.password }),
            headers: { "Content-Type": "application/json" }
        });
        let user = await response.json();
        // console.log("authenticate: " + JSON.stringify(data));
        this.props.setUser(user);
    }

    async register() {
        if (this.state.username === null || this.state.password === null || this.state.email === null) {
            alert("Must Fill Out All Fields");
            return;
        }

        let response = await fetch(`${api_url()}/register`, {
            method: "post",
            body: JSON.stringify({ email: this.state.email, username: this.state.username, password: this.state.password }),
            headers: { "Content-Type": "application/json" }
        });
        let user = await response.json();
        console.log('user: ' + JSON.stringify(user));
        this.props.setUser(user);
    }

    render() {
        if (this.state.isRegistering === true) {
            return (
                <div className="login-container">
                <div className="login-controls">
                    <input className="login-input" type="email" name="email" placeholder="Email Address" onChange={e => this.onChangeEmail(e)}></input>
                    <input className="login-input" name="username" placeholder="Username" onChange={e => this.onChangeUsername(e)}></input>
                    <input className="login-input" type="password" name="password" placeholder="Password" onChange={e => this.onChangePassword(e)}></input>
                    <button className="login-button" onClick={this.register}>Register</button>
                </div>
            </div>
            )
        }
        else {
            return (
                <div className="login-container">
                    <div className="login-controls">
                        <input className="login-input" type="email" name="email" placeholder="Email Address" onChange={e => this.onChangeEmail(e)}></input>
                        <input className="login-input" type="password" name="password" placeholder="Password" onChange={e => this.onChangePassword(e)}></input>
                        {/* <input name="username" placeholder="Username" onChange={e => this.onChangeUsername(e)}></input> */}
                        <button className="login-button" onClick={this.authenticate}>Login</button>
                        <button className="login-button" onClick={() => this.setState({ isRegistering: true })}>Register</button>
                    </div>
                </div>
            );
        }
    }
}
