import React, { Component } from 'react'

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.authenticate = this.authenticate.bind(this);
        this.state = {
            email: "",
            username: "",
            password: ""
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
        let response = await fetch('https://localhost:5001/darts/authenticate', {
            method: "post",
            body: JSON.stringify({ email: this.state.email, password: this.state.password }),
            headers: { "Content-Type": "application/json" }
        });
        let user = await response.json();
        // console.log("authenticate: " + JSON.stringify(data));
        this.props.setUser(user);
    }

    register() {

    }

    render() {
        return (
            <div className="login">
                <input name="email" placeholder="Email Address" onChange={e => this.onChangeEmail(e)}></input>
                <input name="password" placeholder="Password" onChange={e => this.onChangePassword(e)}></input>
                {/* <input name="username" placeholder="Username" onChange={e => this.onChangeUsername(e)}></input> */}
                <button onClick={this.authenticate}>Login</button>
            </div>
        );
    }
}
