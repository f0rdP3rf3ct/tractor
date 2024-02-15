import { MainScene } from './scenes/main-scene';
import {TileScene} from "./scenes/tile-scene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#fbff66',
  parent: 'game',
  scene: [TileScene],
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
    }
  }
};
