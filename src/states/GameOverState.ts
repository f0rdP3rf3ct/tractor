import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {InGameUI} from "../objects/InGameUI";
import {TileScene} from "../scenes/tile-scene";
import {Controls} from "../misc/Controls";
import {EndGameUI} from "../objects/EndGameUI";

export class GameOverState implements State {

    private scene: TileScene;

    private controls: Controls;

    private endGameUI: EndGameUI;

    constructor(scene: TileScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.endGameUI = new EndGameUI(this.scene, 400, 300);
        this.scene.add.existing(this.endGameUI);
    }

    exit(): void {
        this.removeEventListeners();
        this.endGameUI.destroy();
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

    private removeEventListeners(): void {
        this.controls.inputActionEvent.removeListener(Controls.INPUT_ACTION_EVENT_KEY);
    }
}
