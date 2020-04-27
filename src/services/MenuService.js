import { api_url } from '../utils';

export default class MenuService {

    async getGameOptions(user) {
        let response = await fetch(`${api_url()}/options`, {
        method: "get",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.JwtToken 
        }
        });

        if (!response.ok) throw new Error("Unable to Retrieve Configuration");

        let { GameTypes, GameVariations, GameSettings } = await response.json();
        return new AllOptions(GameTypes, GameVariations, GameSettings);
    }
}

function AllOptions(GameTypes, GameVariations, GameSettings) {
    this.GameTypes = GameTypes;
    this.GameVariations = GameVariations;
    this.GameSettings = GameSettings;
}