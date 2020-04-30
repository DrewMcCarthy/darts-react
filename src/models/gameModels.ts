export type GameType = {
    id: number,
    name: string
}

export type GameVariation = {
    id: number,
    gameTypeId: number,
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
    [key: string] : any;
    gameType: GameType | null;
    gameVariation: GameVariation | null;
    gameSetting: GameSetting | null;
};

export type AllOptions = {
    gameTypes: Array<GameType> | null;
    gameVariations: Array<GameVariation> | null;
    gameSettings: Array<GameSetting> | null;
};

export type Dart = {
    mark: number,
    multiplier: number,
    value: number,
    display: string
}

export type Player = {
    id: number,
    name: string,
    score: number | null | undefined,
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
    gameId: number,
    gameOptions: GameOptions | null,
    activePlayer: ActivePlayer,
    players: Array<Player>,
    turnScore: number,
    turnDarts: Array<Dart>,
    transitionLabel: string,
    isTransitioning: boolean,
    isBust: boolean,
    isWinner: boolean,
    isTurnEnd: boolean,
    isWaitingForPlayers: boolean
}

export type PlayerAction = {
    player: Player,
    source: PlayerActionSource,
    type: PlayerActionType,
    dart: Dart // the dart object for throwDart or empty for other actions
}

export enum PlayerActionSource { local, remote };
export enum PlayerActionType { throwDart, endTurn, leaveGame };
export enum GameStatuses { StartedLocal, StartedOnline, Joined };
export enum GameScreens { Login, Menu, Lobby, Game };
// Assign ID from public.game_settings
export enum InOutSetting { OpenOpen = 1, OpenDouble = 2, DoubleDouble = 3 };