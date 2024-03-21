import {LoadingScene} from "./loading-scene";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    preload() {
        this.load.atlas(LoadingScene.UI_ATLAS_KEY, './assets/spritesheets/uiAssets.png', './assets/spritesheets/uiAssets.json');
    }
    create() {
       this.scene.start('LoadingScene');
    }
}
