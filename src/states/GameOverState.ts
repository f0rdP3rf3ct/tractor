import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {Controls} from "../misc/Controls";
import {PlayScene} from "../scenes/play-scene";

export class GameOverState implements State {

    private scene: PlayScene;

    private controls: Controls;

    constructor(scene: PlayScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.addEventListeners();
    }

    exit(): void {
        this.removeEventListeners();
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

    private addEventListeners(): void {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    this.scene.shutDown();
                    this.scene.scene.start('MenuScene');
                    break;
            }
        })
    }

    private removeEventListeners(): void {
        this.controls.inputActionEvent.removeListener(Controls.INPUT_ACTION_EVENT_KEY);
    }
}
