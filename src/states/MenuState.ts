import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {PlayScene} from "../scenes/play-scene";
import {Controls} from "../misc/Controls";
import {CountDownState} from "./CountDownState";
import {EventBus, UI_EVENTS, GAME_EVENTS} from "../ui/EventBus";

export class MenuState implements State {

    private scene: PlayScene;

    private controls: Controls;

    constructor(scene: PlayScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.scene.getInputState().moveDir.setTo(0, 0);
        EventBus.emit(UI_EVENTS.SHOW_INGAME_MENU);
        EventBus.once(GAME_EVENTS.START_PLAY, () => {
            this.scene.changeState(new CountDownState(this.scene));
        });
        this.addEventListeners();
    }

    exit(): void {
        EventBus.removeListener(GAME_EVENTS.START_PLAY);
        EventBus.emit(UI_EVENTS.HIDE_INGAME_MENU);
        this.removeEventListeners();
    }

    updateState(stateMachine: StateMachineInterface): void {
        this.updateInput();
    }

    private addEventListeners(): void {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    EventBus.emit(GAME_EVENTS.START_PLAY);
                    break;
            }
        })
    }

    private removeEventListeners(): void {
        this.controls.inputActionEvent.removeListener(Controls.INPUT_ACTION_EVENT_KEY);
    }

    private updateInput() {
    }

}
