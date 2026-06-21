import {PlayScene} from "./play-scene";
import {EventBus, UI_EVENTS} from "../ui/EventBus";

export class LoadingScene extends Phaser.Scene {

    static UI_ATLAS_KEY = 'uiAssets';

    constructor() {
        super({key: 'LoadingScene'});
    }

    preload() {
        this.load.on('progress', (value: number) => {
            EventBus.emit(UI_EVENTS.LOADING_PROGRESS, { progress: value });
        });

        this.load.on('complete', () => {
            EventBus.emit(UI_EVENTS.LOADING_COMPLETE);
        });

        this.loadAssets();
    }

    private loadAssets() {
        // sprites
        this.load.atlas(PlayScene.GAME_ATLAS_KEY, './assets/spritesheets/gameAssets.png', './assets/spritesheets/gameAssets.json');

        // audio
        this.load.audio('backgroundTheme', ['./assets/audio/backgroundTheme01.mp3', './assets/audio/backgroundTheme01.ogg']);
        this.load.audio('tractorEngine', ['./assets/audio/tractorEngine01.mp3', './assets/audio/tractorEngine01.ogg']);
        this.load.audio('harvesting', ['./assets/audio/harvesting01.mp3', './assets/audio/harvesting01.ogg']);
        this.load.audio('honk', ['./assets/audio/honk01.mp3', './assets/audio/honk01.ogg']);
        this.load.audio('coin', ['./assets/audio/coin01.mp3', './assets/audio/coin01.ogg']);
        this.load.audio('win', ['./assets/audio/win01.mp3', './assets/audio/win01.ogg']);
    }

    create() {
        this.scene.start('MenuScene');
    }
}
