import {LoadingScene} from "./loading-scene";

export class MenuScene extends Phaser.Scene {

    private logo: Phaser.GameObjects.Image;

    private buttonNewGame: Phaser.GameObjects.Image;

    private buttonControls: Phaser.GameObjects.Image;

    constructor() {
        super({key: 'MenuScene'});
    }

    preload() {
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image(0, 0, LoadingScene.UI_ATLAS_KEY, 'background.png').setOrigin(0, 0);
        this.logo = this.add.image(width * 0.5, 160, LoadingScene.UI_ATLAS_KEY, 'Logo.png');
        this.buttonNewGame = this.add.image(width * 0.5, 302, LoadingScene.UI_ATLAS_KEY, 'new_game.png');
        this.buttonControls = this.add.image(width * 0.5, 350, LoadingScene.UI_ATLAS_KEY, 'controls.png');

        this.tweens.add({
            targets: this.logo,
            y: '+=20',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    }

    update(time: number, delta: number) {

    }
}
