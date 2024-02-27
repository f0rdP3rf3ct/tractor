import {TileScene} from "./scenes/tile-scene";
import {LoadingScene} from "./scenes/loading-scene";
import {BootScene} from "./scenes/boot-scene";
import {MenuScene} from "./scenes/menu-scene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#fbff66',
  parent: 'game',
  scene: [BootScene, MenuScene, LoadingScene, TileScene],
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
    }
  }
};
