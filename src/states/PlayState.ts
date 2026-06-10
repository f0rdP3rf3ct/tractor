import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {Controls} from "../misc/Controls";
import {PlayScene} from "../scenes/play-scene";
import {MenuState} from "./MenuState";
import {IS_DEBUG} from "../misc/DebugConfig";

export class PlayState implements State {

    private controls: Controls;

    private scene: PlayScene;

    private stateMachine: StateMachineInterface;

    constructor(scene: PlayScene) {
        this.scene = scene;
        this.controls = new Controls(scene);
    }

    public enter(stateMachine: StateMachineInterface): void {
        this.stateMachine = stateMachine;
        this.addEventListeners();
    }

    public exit(): void {
        if (IS_DEBUG) {
            this.scene.input.keyboard.off('keydown-F1');
        }
    }

    public updateState(stateMachine: StateMachineInterface, delta: number): void {
        this.updateInput();
        this.scene.updatePlay();
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

        if (IS_DEBUG) {
            this.scene.input.keyboard.on('keydown-F1', () => {
                this.scene.toggleDebugView();
            });
        }
    }

    private updateInput(): void {
        if (this.controls) {
            this.controls.update();
        }

        const input = this.scene.getInputState();
        let inputLocked = false;

        input.moveDir.x = input.moveDir.y = 0;

        if (this.controls.up() && !inputLocked) {
            input.lastDirection = 'up';
            input.moveDir.y = -1;
            input.facingDir = -1;
            inputLocked = true;
        }

        if (this.controls.down() && !inputLocked) {
            input.lastDirection = 'down';
            input.moveDir.y = 1;
            input.facingDir = -1;
            inputLocked = true;
        }

        if (this.controls.left() && !inputLocked) {
            input.lastDirection = 'left';
            input.moveDir.x = 1;
            input.facingDir = 1;
            inputLocked = true;
        }

        if (this.controls.right() && !inputLocked) {
            input.lastDirection = 'right';
            input.moveDir.x = -1;
            input.facingDir = 1;
            inputLocked = true;
        }
    }

}
