import {Controls} from "../misc/Controls";
import {EventBus, UI_EVENTS, GAME_EVENTS} from "../ui/EventBus";

export class MenuScene extends Phaser.Scene {

    private controls: Controls;

    constructor() {
        super({key: 'MenuScene'});
    }

    create() {
        EventBus.emit(UI_EVENTS.SHOW_MENU);

        this.controls = new Controls(this);
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            if (key === Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A) {
                EventBus.emit(GAME_EVENTS.START_GAME);
            }
        });

        EventBus.once(GAME_EVENTS.START_GAME, () => {
            EventBus.emit(UI_EVENTS.HIDE_MENU);
            this.scene.start('PlayScene');
        });
    }

    update(_time: number, _delta: number) {
        this.controls.update();
    }
}
