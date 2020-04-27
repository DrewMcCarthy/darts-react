import { api_url } from "../utils";

export default class LobbyService {
    
    async getGames(user) {
        let response = await fetch(`${api_url()}/lobby`, {
            method: "get",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + user.JwtToken
            }
        });

        if (!response.ok) throw new Error("Error Fetching Lobby Games");

        let games = await response.json();
        return games;
    }
}