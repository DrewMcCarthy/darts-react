// Take the current game state and the player action and return the updated game state

// skip if local action and (activePlayer.id != User.id OR transitioning)
// skip if remote action and (activePlayer.id != PlayerAction.player.id)
// handle end turn action
// handle throw dart action
// if local then send action to server


/* Needed from caller:

DATA:
    playerAction
    actionSource
    activePlayer
    players
    User
    forceEndTurnFlag
    turnDarts

CALLBACKS:
    startTransition
    finishTransition

*/
import { ActivePlayer, Dart, Player, PlayerAction, 
    AllOptions, SelectedOptions, User } from "./gameModels";
import { api_url } from "../../utils";

export default class ZeroOne {
    constructor(user) {
        this.user = new User(user.Id, user.Email, user.Username, user.JwtToken);
    }

    async getAllOptions() {
        let response = await fetch(`${api_url()}/options`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.user.jwtToken,
            },
        });
        let {GameTypes, GameVariations} = await response.json();
        return new AllOptions(GameTypes, GameVariations);
    }
}



transitionTurn = (players, activePlayer, tempScore, startTransitionCallback) => {
    let updPlayers = setEndOfTurnScore(players, activePlayer, tempScore);
    startTransition(players, activePlayer, startTransitionCallback);
    finishTransition(players, updPlayers, activePlayer, 3000);
};

/**
 * Set player score to what they have after taking their turn
*/ 
setEndOfTurnScore = (players, activePlayer, tempScore) => {
    let updPlayers = [...players];
    let updActivePlayer = updPlayers[activePlayer.index];
    updActivePlayer.score = tempScore;
    updPlayers[activePlayer.index] = updActivePlayer;
    return updPlayers;
}

/**
 * Get next player's name. Callback to start transition
 */
startTransition = (players, activePlayer, startTransitionCallback) => {
    let nextIndex = nextPlayerIndex(players, activePlayer);
    let nextPlayerName = players[nextIndex].name;  
    startTransitionCallback(`End of Turn - ${nextPlayerName} Is Up`);
}


finishTransition = (players, updPlayers, activePlayer, timeoutMs, finishTransitionCallback) => {
    let activePlayer = nextActivePlayer(players, activePlayer);
    let startTurnState = {
        transitioning: false,
        turnDarts: [],
        tempScore: updPlayers[activePlayer.index].score,
        players: updPlayers,
    };

    setTimeout(() => {
        finishTransitionCallback(startTurnState);
    }, timeoutMs);
};

/**
 * Used to get player name for transition
 * If last player is active then cycle back to first player
 * Else, increment by 1
 */ 
nextPlayerIndex = (players, activePlayer) => {
    let numPlayers = players.length;
    if ((activePlayer.index + 1) === numPlayers) {
        return 0;
    }
    else {
        return activePlayer.index + 1;
    }
}


nextActivePlayer = (players, activePlayer, setStateCallback) => {
    let nextIndex = nextPlayerIndex(players, activePlayer);
    let nextId = players[nextIndex].id;
    let ActivePlayer = new ActivePlayer(nextId, nextIndex);
    //setStateCallback(activePlayer, ActivePlayer);
    return ActivePlayer;
}
