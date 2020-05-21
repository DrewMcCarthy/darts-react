// Take the current game state and the player action and return the updated game state

// skip if local action and (activePlayer.id != User.id OR transitioning)
// skip if remote action and (activePlayer.id != PlayerAction.player.id)
// handle end turn action
// handle throw dart action
// if local then send action to server

import { GameState, PlayerAction, PlayerActionSource, PlayerActionType, Dart, Player, ActivePlayer, GameOptions, InOutSetting } from "../../models/gameModels";

export let zeroOnePlayerAction = (gameState: GameState, playerAction: PlayerAction): GameState => {
    let newGameState: GameState = {...gameState};

    // Process local player action
    if (playerAction.source === PlayerActionSource.local) {
        if (newGameState.isTransitioning) {
            return newGameState;
        }
        else { // Process action types
            if (playerAction.type === PlayerActionType.throwDart) {
                newGameState = handleThrowDart(newGameState, playerAction);
            } else if (playerAction.type === PlayerActionType.endTurn) {
                newGameState = handleEndTurn(newGameState, playerAction);
            }
        }
    }
    // Process remote player action
    else if (playerAction.source === PlayerActionSource.remote) {
        if (newGameState.activePlayer.userId !== playerAction.player.id) {
            return newGameState;
        } else {
            // Process action types
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
    // let tempScore = newGameState.turnScore - playerAction.dart.value;
    newGameState.turnScore = newGameState.turnScore - playerAction.dart.value;
    // newGameState.turnScore = setTurnScore(newGameState.players, newGameState.activePlayer, newGameState.isTurnEnd, newGameState.turnScore);
    newGameState.isWinner = setWinner(newGameState.turnScore, newGameState.gameOptions, playerAction.dart);
    newGameState.isBust = setBust(newGameState.turnScore, newGameState.gameOptions, playerAction.dart);
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

    if (newGameState.isTurnEnd || newGameState.isBust) {
        newGameState.turnDarts = [];
    }
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

    if (newGameState.isTurnEnd || newGameState.isBust) {
        newGameState.turnDarts = [];
    }
    
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

let setBust = (turnScore: number, gameOptions: GameOptions | null, dart: Dart): boolean => {
    if (turnScore < 0) return true;

    // Using the enum values greater than OpenOpen to determine double out
    // TODO: need to improve this
    if (gameOptions!.gameSetting!.id > InOutSetting.OpenOpen) {
        if (turnScore === 1) return true;
        if (turnScore === 0 && dart.multiplier !== 2) return true;
    }
    return turnScore < 0 ? true : false;
};

let setWinner = (turnScore: number, gameOptions: GameOptions | null, dart: Dart): boolean => {
    // Using the enum values greater than OpenOpen to determine double out
    // TODO: need to improve this
    if (gameOptions!.gameSetting!.id > InOutSetting.OpenOpen) {
        if (dart.multiplier === 2) {
            return turnScore === 0 ? true : false;
        } else {
            return false;
        }
    } else {
        return turnScore === 0 ? true : false;
    }
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

    // TurnEnd needs to be last
    if (isBust) {
        transitionLabel = `${playerName} Busted!
        ${nextPlayerName} Is Up Next`;
    } else if (isWinner) {
        transitionLabel = `${playerName} Wins!`;
    } else if (isTurnEnd) {
        transitionLabel = `End of ${playerName}'s Turn
        ${nextPlayerName} Is Up Next`;
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
            userId: nextId,
            index: nextIndex,
        };
        return nextActivePlayer;
    }
};

// let setTurnScore = (players: Array<Player>, activePlayer: ActivePlayer, isTurnEnd: boolean, turnScore: number): number => {
//     if (!isTurnEnd) {
//         return activePlayer;
//     } else {
//         let nextIndex = nextPlayerIndex(players, activePlayer);
//         let nextId = players[nextIndex].id;
//         let nextActivePlayer: ActivePlayer = {
//             userId: nextId,
//             index: nextIndex,
//         };
//         return nextActivePlayer;
//     }
//}