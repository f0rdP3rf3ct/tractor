import {TileScene} from "./scenes/tile-scene";
import {LoadingScene} from "./scenes/loading-scene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#fbff66',
  parent: 'game',
  scene: [LoadingScene, TileScene],
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
    }
  }
};
