import { api_url } from '../utils'; 

export default class LoginService {
    // constructor() {}

    async authenticate(email, password) {
        if (!email || !password) {
            alert("Must Fill Out All Fields");
            return;
        }

        let response = await fetch(`${api_url()}/authenticate`, {
            method: "post",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) throw new Error("Incorrect email or password");

        let user = await response.json();
        return user;
    }

    async register(email, password, username) {
        if (!username || !password || !email ) {
            alert("Must Fill Out All Fields");
            return;
        }

        let response = await fetch(`${api_url()}/register`, {
            method: "post",
            body: JSON.stringify({ email, username, password }),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Registration Failed");

        let user = await response.json();
        return user;
    }
}