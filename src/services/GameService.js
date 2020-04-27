import { api_url } from "../utils";

export default class GameService {

    async getGameInfo(user, gameId) {
        let response = await fetch(`${api_url()}/game/${gameId}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + user.JwtToken,
            },
        });

        if (!response.ok) throw new Error("Fetch of Game Info Failed");

        let gameInfo = await response.json();
        // console.log("gameInfo: " + JSON.stringify(gameInfo));
        return gameInfo;
    }

    async postNewGame(user, data) {
        let response = await fetch(`${api_url()}/creategame`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + user.JwtToken,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Posting New Game Failed");

        let gameId = await response.json();
        return gameId;
    }

}