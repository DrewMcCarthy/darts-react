import * as Models from "../models/gameModels";
import GameService from "./GameService";

export default class GameSetupService {
    gameState: Models.GameState | null;
    gameStatus: Models.GameStatuses | null;
    user: Models.User | null;
    gameService: GameService;

    constructor(gameService: GameService) {
        this.gameState = null;
        this.gameStatus = null;
        this.user = null;
        this.gameService = gameService;
    }

    initGame = async (
        gameState: Models.GameState | null,
        gameStatus: Models.GameStatuses | null,
        user: Models.User
    ): Promise<Models.GameState> => {

        this.gameState = { ...gameState } as Models.GameState;
        this.gameStatus = gameStatus;
        this.user = { ...user };

        if (this.gameStatus === Models.GameStatuses.Joined) {
            try {
                let gameInfo = await this.gameService.getGameInfo(this.user, this.gameState.gameId);
                if (gameInfo) {
                    let creator = {
                        id: gameInfo.createdByUserId,
                        name: gameInfo.createdBy,
                        score: gameInfo.startScore,
                        gameDarts: [],
                    };
                    let joiner = {
                        id: this.user.id,
                        name: this.user.username,
                        score: gameInfo.startScore,
                        gameDarts: [],
                    };
                    let players = [creator, joiner];
                    this.gameState.players = players;
                    this.gameState.activePlayer = { index: 0, id: creator.id };
                    this.gameState.turnScore = gameInfo.startScore;
                    this.gameState.isWaitingForPlayers = false;
                }
            } catch (error) {
                alert(error);
            }

        } else if (this.gameStatus === Models.GameStatuses.StartedOnline) {
            let turnScore = this.gameState.gameOptions?.gameVariation?.startScore;
            let creator: Models.Player = {
                id: this.user.id,
                name: this.user.username,
                score: this.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: [],
            };
            let players = [creator];
            this.gameState.players = players;
            this.gameState.turnScore = turnScore ? turnScore : 0;

        } else if (this.gameStatus === Models.GameStatuses.StartedLocal) {
            let turnScore = this.gameState.gameOptions?.gameVariation?.startScore;
            let playerOne = {
                id: this.user.id,
                name: this.user.username,
                score: this.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: [],
            };
            let playerTwo = {
                id: 99,
                name: "Guest",
                score: this.gameState.gameOptions?.gameVariation?.startScore,
                gameDarts: [],
            };
            let players = [playerOne, playerTwo];
            this.gameState.players = players;
            this.gameState.activePlayer = { index: 0, id: playerOne.id };
            this.gameState.turnScore = turnScore ? turnScore : 0;
            this.gameState.isWaitingForPlayers = false;
        };

        return this.gameState;
    }
}