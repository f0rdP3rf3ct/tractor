import { MainScene } from './scenes/main-scene';
import {TileScene} from "./scenes/tile-scene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  parent: 'game',
  scene: [TileScene]
};
