function ActivePlayer(id, index) {
    this.id = id;
    this.index = index;
}

function Dart(mark, multiplier) {
    this.mark = mark;
    this.multiplier = multiplier;
}

function Player(id, name, score) {
    this.id = id;
    this.name = name;
    this.score = score;
}

function User(id, email, username, jwtToken) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.jwtToken = jwtToken;
}

function PlayerAction(player, type, action) {
    this.player = player;
    this.type = type; // throwDart, endTurn
    this.action = action; // or empty for other types
}

function AllOptions(types, variations) {
    this.types = types;
    this.variations = variations;
}

function SelectedOptions(host, inOut, type, variation) {
    this.host = host;
    this.inOut = inOut;
    this.type = type;
    this.variation = variation;
}

export default { ActivePlayer, Dart, 
    Player, PlayerAction, AllOptions, SelectedOptions,
    User }