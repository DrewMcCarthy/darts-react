import { api_url } from '../utils';

export default class MenuService {
    constructor() {

    }

    async getGameOptions() {
        let response = await fetch(`${api_url()}/options`, {
        method: "get",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + this.props.user.JwtToken 
        }
        });
        let { GameTypes, GameVariations } = await response.json();
        return new AllOptions(GameTypes, GameVariations);
    }
}

function AllOptions(types, variations) {
    this.types = types;
    this.variations = variations;
}