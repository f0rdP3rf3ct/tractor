import {TileScene} from "./tile-scene";

export class LoadingScene extends Phaser.Scene {

    static UI_ATLAS_KEY = 'uiAssets';

    constructor() {
        super({key: 'LoadingScene'});
    }

    preload() {

        this.add.image(0, 0, LoadingScene.UI_ATLAS_KEY, 'background.png').setOrigin(0, 0);

        const progressBar = this.add.graphics();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image((width * 0.5), (height * 0.5), LoadingScene.UI_ATLAS_KEY, 'loading.png');

        this.load.on('progress', function (value: number) {
            // percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xff4124, 1);
            progressBar.fillRect(250, 326, 300 * value, 5);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
        });

        this.loadAssets();
    }

    private loadAssets() {
        // sprites
        this.load.atlas(TileScene.GAME_ATLAS_KEY, '../assets/spritesheets/gameAssets.png', '../assets/spritesheets/gameAssets.json');

        // audio
        this.load.audio('backgroundTheme', ['../assets/audio/backgroundTheme01.mp3', '../assets/audio/backgroundTheme01.ogg']);
        this.load.audio('tractorEngine', ['../assets/audio/tractorEngine01.mp3', '../assets/audio/tractorEngine01.ogg']);
        this.load.audio('harvesting', ['../assets/audio/harvesting01.mp3', '../assets/audio/harvesting01.ogg']);
    }

    create() {
        this.scene.start('MenuScene');
    }
}
