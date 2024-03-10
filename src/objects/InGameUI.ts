import {Scene} from "phaser";
import Image = Phaser.GameObjects.Image;

export class InGameUI extends Phaser.GameObjects.Container {

    static INGAME_UI_KEY = 'inGameUi';

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);
        this.addChildren();
    }

    protected addChildren() {
        const image = new Image(this.scene, 0, 0, InGameUI.INGAME_UI_KEY, 'modal_background.png');

        const modalTitle = new Image(this.scene, 0, -140, InGameUI.INGAME_UI_KEY, 'modal_title_controls.png');

        const keyboardControls = new Image(this.scene, 0, 40, InGameUI.INGAME_UI_KEY, 'keyboard_controls.png');

        const hitSpaceToStart = new Image(this.scene, 0, 160, InGameUI.INGAME_UI_KEY, 'hit_space_to_start.png');


        this.add(image);
        this.add(modalTitle);
        this.add(keyboardControls);
        this.add(hitSpaceToStart);

    }


}
