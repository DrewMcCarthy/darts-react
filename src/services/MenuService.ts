import { api_url } from '../utils';
import * as Models from "../models/gameModels";

export default class MenuService {

    async getAllOptions(user: Models.User): Promise<Models.AllOptions> {
        let response = await fetch(`${api_url()}/options`, {
        method: "get",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.jwtToken 
        }
        });

        if (!response.ok) throw new Error("Unable to Retrieve Game Options");

        let allOptions: Models.AllOptions = await response.json();
        return allOptions;
    }
}
