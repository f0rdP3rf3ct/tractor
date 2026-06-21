import 'Phaser';
import { GameConfig } from './config';
import { initGameBridge } from './ui/GameBridge';

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  const game = new Game(GameConfig);
  initGameBridge();
});
