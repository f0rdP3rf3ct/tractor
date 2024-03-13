import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {Controls} from "../misc/Controls";
import {TileScene} from "../scenes/tile-scene";
import {MenuState} from "./MenuState";

export class PlayState implements State {

    private controls: Controls;

    private scene: TileScene;

    private stateMachine: StateMachineInterface;

    constructor(scene: TileScene) {
        this.scene = scene;
        this.controls = new Controls(scene);
    }

    public enter(stateMachine: StateMachineInterface): void {
        this.stateMachine = stateMachine;
        this.addEventListeners();
    }

    public exit(): void {
    }

    public updateState(stateMachine: StateMachineInterface): void {
        this.updateInput();
        this.scene.updateRenderPlayerVehicle();
    }

    private addEventListeners(): void {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_L:
                    this.scene.cyclePlayerVehicle(-1);
                    break;
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_R:
                    this.scene.cyclePlayerVehicle(1);
                    break;
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    this.scene.playAudioHonk();
                    break;
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_START:
                    this.scene.changeState(new MenuState(this.scene))
            }
        })
    }

    private updateInput(): void {
        if (this.controls) {
            this.controls.update();
        }

        let moveDir = this.scene.getMoveDir();
        let lastDirection = this.scene.getLastDirection();
        let playerFacingDir = this.scene.getPlayerFacingDirection();
        let inputLocked = false;

        moveDir.x = moveDir.y = 0;

        if (this.controls.up() && !inputLocked) {
            lastDirection = 'up';

            moveDir.y = -1;
            playerFacingDir = -1;

            inputLocked = true;
        }

        if (this.controls.down() && !inputLocked) {
            lastDirection = 'down';

            moveDir.y = 1;
            playerFacingDir = -1;

            inputLocked = true;
        }

        if (this.controls.left() && !inputLocked) {
            lastDirection = 'left';

            moveDir.x = 1;
            playerFacingDir = 1;

            inputLocked = true;
        }

        if (this.controls.right() && !inputLocked) {
            lastDirection = 'right';

            moveDir.x = -1;
            playerFacingDir = 1;

            inputLocked = true;
        }

        this.scene.setMoveDir(moveDir);
        this.scene.setLastDirection(lastDirection);
        this.scene.setPlayerFacingDirection(playerFacingDir);
    }

}
