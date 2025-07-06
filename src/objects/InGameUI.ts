import {Scene} from "phaser";
import Image = Phaser.GameObjects.Image;

export class InGameUI extends Phaser.GameObjects.Container {

    static INGAME_UI_KEY = 'inGameUi';

    protected hitSpaceToStart: Image;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);
        this.addChildren();
        this.createTweens();
    }

    protected addChildren() {
        const image = new Image(this.scene, 0, 0, InGameUI.INGAME_UI_KEY, 'modal_background.png');

        const modalTitle = new Image(this.scene, 0, -140, InGameUI.INGAME_UI_KEY, 'modal_title_controls.png');

        const keyboardControls = new Image(this.scene, 0, 40, InGameUI.INGAME_UI_KEY, 'keyboard_controls.png');

        this.hitSpaceToStart = new Image(this.scene, 0, 160, InGameUI.INGAME_UI_KEY, 'hit_space_to_start.png');


        this.add(image);
        this.add(modalTitle);
        this.add(keyboardControls);
        this.add(this.hitSpaceToStart);
    }

    protected createTweens() {
        this.scene.tweens.add({
            targets: this.hitSpaceToStart,
            alpha: 0,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        })
    }


}
