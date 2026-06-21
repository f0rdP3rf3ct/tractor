import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {PlayScene} from "../scenes/play-scene";
import {Controls} from "../misc/Controls";
import {CountDownState} from "./CountDownState";

export class MenuState implements State {

    private scene: PlayScene;

    private controls: Controls;

    constructor(scene: PlayScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.scene.getInputState().moveDir.setTo(0, 0);
        this.addEventListeners();
    }

    exit(): void {
        this.removeEventListeners();
    }

    updateState(stateMachine: StateMachineInterface): void {
        this.updateInput();
    }

    private addEventListeners(): void {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    this.scene.changeState(new CountDownState(this.scene));
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
