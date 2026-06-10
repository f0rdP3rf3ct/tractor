import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {Controls} from "../misc/Controls";
import {EndGameUI} from "../objects/EndGameUI";
import {TileScene} from "../scenes/tile-scene";

export class GameOverState implements State {

    private scene: TileScene;

    private controls: Controls;

    private endGameUI: EndGameUI;

    constructor(scene: TileScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.endGameUI = new EndGameUI(this.scene, 400, 300, () => this.scene.playAudioCoin());
        this.scene.add.existing(this.endGameUI);
        this.addEventListeners();
    }

    exit(): void {
        this.removeEventListeners();
        this.endGameUI.destroy();
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
