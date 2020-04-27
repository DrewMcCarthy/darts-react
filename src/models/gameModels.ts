export type GameType = {
    id: number,
    name: string
}

export type GameVariation = {
    id: number,
    name: string,
    startScore: number
}

export type GameSetting = {
    id: number,
    gameTypeId: number,
    category: string,
    name: string
}

export type GameOptions = {
    type: GameType,
    variation: GameVariation,
    setting: GameSetting
}

export type Dart = {
    mark: number,
    multiplier: number,
    value: number,
    display: string
}

export type Player = {
    id: number,
    name: string,
    score: number,
    gameDarts: Array<Dart>
}

export type ActivePlayer = {
    id: number,
    index: number
}

export type User = {
    id: number,
    email: string,
    username: string,
    jwtToken: string
}

export type GameState = {
    user: User,
    gameOptions: GameOptions,
    activePlayer: ActivePlayer,
    players: Array<Player>,
    turnScore: number,
    turnDarts: Array<Dart>,
    transitionLabel: string,
    isTransitioning: boolean,
    isBust: boolean,
    isWinner: boolean,
    isTurnEnd: boolean
}

export type PlayerAction = {
    player: Player,
    source: PlayerActionSource,
    type: PlayerActionType,
    dart: Dart // the dart object for throwDart or empty for other actions
}

export enum PlayerActionSource { local, remote };
export enum PlayerActionType { throwDart, endTurn, leaveGame };

