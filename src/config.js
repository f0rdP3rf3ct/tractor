"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameConfig = void 0;
const main_scene_1 = require("./scenes/main-scene");
exports.GameConfig = {
    title: 'Just tractor driving',
    url: 'https://github.com/digitsensitive/phaser3-typescript',
    version: '1.0',
    width: 800,
    height: 600,
    backgroundColor: 0x3a404d,
    type: Phaser.AUTO,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [main_scene_1.MainScene]
};
