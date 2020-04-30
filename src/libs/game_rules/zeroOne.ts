// Take the current game state and the player action and return the updated game state

// skip if local action and (activePlayer.id != User.id OR transitioning)
// skip if remote action and (activePlayer.id != PlayerAction.player.id)
// handle end turn action
// handle throw dart action
// if local then send action to server

import { GameState, PlayerAction, PlayerActionSource, PlayerActionType, Dart, Player, ActivePlayer } from "../../models/gameModels";

export let handlePlayerAction = (gameState: GameState, playerAction: PlayerAction): GameState => {
    let newGameState: GameState = {...gameState};

    // Process local player action
    if (playerAction.source === PlayerActionSource.local) {
        if (newGameState.isTransitioning) {
            return newGameState;
        }
        else {
            if (playerAction.type === PlayerActionType.throwDart) {
                newGameState = handleThrowDart(newGameState, playerAction);
            } else if (playerAction.type === PlayerActionType.endTurn) {
                newGameState = handleEndTurn(newGameState, playerAction);
            }
        }
    }
    // Process remote player action
    else if (playerAction.source === PlayerActionSource.remote) {
        if (newGameState.activePlayer.id !== playerAction.player.id) {
            return newGameState;
        }
        else {
            if (playerAction.type === PlayerActionType.throwDart) {
                newGameState = handleThrowDart(newGameState, playerAction);
            } else if (playerAction.type === PlayerActionType.endTurn) {
                newGameState = handleEndTurn(newGameState, playerAction);
            } 
            // else if (playerAction.type === PlayerActionType.leaveGame) {
            //     // send players' gameDarts to server
            //     // send result info to server
            //     newGameState = handleEndGame(newGameState, playerAction);
            // }
        }
    }

    return newGameState;
}

let handleThrowDart = (newGameState: GameState, playerAction: PlayerAction): GameState => {    
    playerAction.dart = setDartValue(playerAction.dart);
    // Add new dart to the ones thrown this round
    newGameState.turnDarts.push(playerAction.dart);
    newGameState.turnScore = newGameState.turnScore - playerAction.dart.value;
    newGameState.isBust = setBust(newGameState.turnScore);
    newGameState.isWinner = setWinner(newGameState.turnScore);
    newGameState.isTurnEnd = setTurnEnd(newGameState.turnDarts, newGameState.isBust);
    newGameState.isTransitioning = setTransitioning(
        newGameState.isBust, 
        newGameState.isWinner,
        newGameState.isTurnEnd
    );
    newGameState.transitionLabel = setTransitionLabel(
        newGameState.players,
        newGameState.activePlayer,
        newGameState.isBust,
        newGameState.isWinner,
        newGameState.isTurnEnd
    );
    newGameState.players = setPlayers(
        newGameState.players,
        newGameState.activePlayer,
        newGameState.isBust,
        newGameState.isWinner,
        newGameState.isTurnEnd,
        newGameState.turnDarts,
        newGameState.turnScore
    );
    newGameState.activePlayer = setActivePlayer(newGameState.players, newGameState.activePlayer, newGameState.isTurnEnd);

    return newGameState;
}

let handleEndTurn = (newGameState: GameState, playerAction: PlayerAction) => {
    newGameState.isTurnEnd = setTurnEnd(newGameState.turnDarts, true);
    newGameState.isTransitioning = setTransitioning(
        newGameState.isBust,
        newGameState.isWinner,
        newGameState.isTurnEnd
    );
    newGameState.transitionLabel = setTransitionLabel(
        newGameState.players,
        newGameState.activePlayer,
        newGameState.isBust,
        newGameState.isWinner,
        newGameState.isTurnEnd
    );
    newGameState.players = setPlayers(
        newGameState.players,
        newGameState.activePlayer,
        newGameState.isBust,
        newGameState.isWinner,
        newGameState.isTurnEnd,
        newGameState.turnDarts,
        newGameState.turnScore
    );
    newGameState.activePlayer = setActivePlayer(
        newGameState.players,
        newGameState.activePlayer,
        newGameState.isTurnEnd
    );

    return newGameState;
};

let handleEndGame = (newGameState: GameState, playerAction: PlayerAction) => {};

let setDartValue = (dart: Dart): Dart => {
    let newDart = dart;
    let mark = dart.mark === 25 ? "Bullseye" : dart.mark;
    newDart.value = dart.mark * dart.multiplier;
    
    if (dart.multiplier === 1) {
        newDart.display =  "Single " + mark;
    } else if (dart.multiplier === 2) {
        newDart.display = "Double " + mark;
    } else if (dart.multiplier === 3) {
        newDart.display = "Triple " + mark;
    }
    return newDart;
}

let setBust = (turnScore: number): boolean => {
    return turnScore < 0 ? true : false;
}

let setWinner = (turnScore: number): boolean => {
    return turnScore === 0 ? true : false;
}

let setTurnEnd = (turnDarts: Array<Dart> = [], forceTurnEnd: boolean = false): boolean => {
    if (turnDarts?.length === 3 || forceTurnEnd ) {
        return true;
    }
    else {
        return false;
    }
}

let setTransitioning = (isBust: boolean, isWinner: boolean, isTurnEnd: boolean): boolean => {
    if (isBust || isWinner || isTurnEnd) {
        return true;
    }
    else {
        return false;
    }
}

let setTransitionLabel = (players: Array<Player>, activePlayer: ActivePlayer, isBust: boolean, isWinner: boolean, isTurnEnd: boolean): string => {
    let playerName = players[activePlayer.index].name;
    let nextIndex = nextPlayerIndex(players, activePlayer);
    let nextPlayerName = players[nextIndex].name;
    let transitionLabel: string = "";

    if (isBust) {
        transitionLabel = `${playerName} Busted!
        ${nextPlayerName} Is Up Next`;
    } else if (isTurnEnd) {
        transitionLabel = `End of ${playerName}'s Turn
        ${nextPlayerName} Is Up Next`;
    }
    else if (isWinner) {
        transitionLabel = `${playerName} Wins!`;
    }

    return transitionLabel;
}

/**
 * Used to get player name for transition
 * If last player is active then cycle back to first player
 * Else, increment by 1
 */ 
let nextPlayerIndex = (players: Array<Player>, activePlayer: ActivePlayer) => {
    let numPlayers = players.length;
    if ((activePlayer.index + 1) === numPlayers) {
        return 0;
    }
    else {
        return activePlayer.index + 1;
    }
}

/**
 * Update player info at then end of their turn
 */
let setPlayers = (players: Array<Player>, activePlayer: ActivePlayer, 
    isBust: boolean, isWinner: boolean, isTurnEnd: boolean, turnDarts: Array<Dart>, turnScore: number): Array<Player> => {
    let playersCopy = [...players];
    
    // No change if player's turn isn't over
    if (!isBust && !isTurnEnd && !isWinner) {
        return playersCopy;
    };

    // Player score doesn't get updated if they busted
    if (isBust) {
        playersCopy[activePlayer.index].gameDarts.push(...turnDarts);
    }
    else if (isTurnEnd || isWinner) {
        playersCopy[activePlayer.index].gameDarts.push(...turnDarts);
        playersCopy[activePlayer.index].score = turnScore;
    };
    
    return playersCopy;
}

let setActivePlayer = (players: Array<Player>, activePlayer: ActivePlayer, isTurnEnd: boolean): ActivePlayer => {
    if (!isTurnEnd) {
        return activePlayer;
    } else {
        let nextIndex = nextPlayerIndex(players, activePlayer);
        let nextId = players[nextIndex].id;
        let nextActivePlayer: ActivePlayer = {
            id: nextId,
            index: nextIndex
        };
        return nextActivePlayer;
    }
};
