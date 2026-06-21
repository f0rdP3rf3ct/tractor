import {Controls} from "../misc/Controls";

export class MenuScene extends Phaser.Scene {

    private controls: Controls;

    constructor() {
        super({key: 'MenuScene'});
    }

    create() {
        this.controls = new Controls(this);

        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    this.scene.start('PlayScene');
                    break;
            }
        });
    }

    update(time: number, delta: number) {
        this.controls.update();
    }
}
