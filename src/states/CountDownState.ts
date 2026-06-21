import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {PlayScene} from "../scenes/play-scene";
import {PlayState} from "./PlayState";

export class CountDownState implements State {

    private scene: PlayScene;

    constructor(scene: PlayScene) {
        this.scene = scene;
    }

    enter(stateMachine: StateMachineInterface): void {
        this.scene.time.delayedCall(4000, () => {
            this.scene.changeState(new PlayState(this.scene));
        });
    }

    exit(): void {
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

}
