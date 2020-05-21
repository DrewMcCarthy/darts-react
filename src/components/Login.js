import React, { Component } from 'react';
import './Login.scss';
import LoginService from '../services/LoginService';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.loginService = new LoginService();
        this.appSetUser = this.props.setUser;
        this.authenticate = this.authenticate.bind(this);
        this.register = this.register.bind(this);
        this.state = {
            email: null,
            username: null,
            password: null,
            isRegistering: false
        }
    }

    onTextChange(event) {
        let { name, value } = event.target;
        this.setState({ [name]: value })
    }

    async authenticate() {
        try {
            let user = await this.loginService.authenticate(this.state.email, this.state.password)        
            if (user)
                this.appSetUser(user);
        } catch (error) {
            alert(error);
        }
    }

    async register() {
        try {
            let user = await this.loginService.register(this.state.email, this.state.password, this.state.username)
            if (user)
                this.appSetUser(user);
        } catch (error) {
            alert(error);
        }
    }

    render() {
        if (this.state.isRegistering === true) {
            return (
                <div className="login-container">
                    <div className="login-controls">
                        <input
                            className="login-input"
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            onChange={(e) => this.onTextChange(e)}></input>
                        <input
                            className="login-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={(e) => this.onTextChange(e)}></input>
                        <input
                            className="login-input"
                            name="username"
                            placeholder="Username"
                            onChange={(e) => this.onTextChange(e)}></input>
                        <button className="login-button" onClick={this.register}>
                            Register
                        </button>
                        <button className="login-button" onClick={() => this.setState({ isRegistering: false })}>
                            Return
                        </button>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="login-container">
                    <form className="login-controls">
                        <input
                            className="login-input"
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            onChange={(e) => this.onTextChange(e)}></input>
                        <input
                            className="login-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={(e) => this.onTextChange(e)}></input>
                        <button className="login-button" onClick={this.authenticate}>
                            Login
                        </button>
                        <button type="submit" className="login-button" onSubmit={() => this.setState({ isRegistering: true })}>
                            Register
                        </button>
                    </form>
                </div>
            );
        }
    }
}
