import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {TileScene} from "../scenes/tile-scene";
import {Controls} from "../misc/Controls";
import {PlayState} from "./PlayState";
import {InGameUI} from "../objects/InGameUI";
import Point = Phaser.Geom.Point;
import {CountDownState} from "./CountDownState";

export class MenuState implements State {

    private scene: TileScene;

    private controls: Controls;

    private inGameUI: InGameUI;

    constructor(scene: TileScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this.scene.setMoveDir(new Point(0, 0));
        this.addEventListeners();

        this.inGameUI = new InGameUI(this.scene, 400, 300);
        this.scene.add.existing(this.inGameUI);
    }

    exit(): void {
        this.inGameUI.destroy();
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

    private updateInput() {

    }

}
