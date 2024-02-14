"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
require("Phaser");
const config_1 = require("./config");
class Game extends Phaser.Game {
    constructor(config) {
        super(config);
    }
}
exports.Game = Game;
window.addEventListener('load', () => {
    const game = new Game(config_1.GameConfig);
});
