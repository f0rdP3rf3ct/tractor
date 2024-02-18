import {TileScene} from "./tile-scene";

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({key: 'LoadingScene'});
    }

    preload() {
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });

        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                color: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value: number) {
            percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

    }

    private loadAssets() {

        // sprites
        this.load.atlas(TileScene.SPRITE_SHEET_KEY, '../assets/spritesheets/gameAssets.png', '../assets/spritesheets/gameAssets.json');

        // audio
        this.load.audio('backgroundTheme', ['../assets/audio/backgroundTheme01.mp3', '../assets/audio/backgroundTheme01.ogg']);
        this.load.audio('tractorEngine', ['../assets/audio/tractorEngine01.mp3', '../assets/audio/tractorEngine01.ogg']);
        this.load.audio('harvesting', ['../assets/audio/harvesting01.mp3', '../assets/audio/harvesting01.ogg']);
    }

    create() {
        this.scene.start('TileScene');
    }
}
