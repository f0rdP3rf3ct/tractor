import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {PlayScene} from "../scenes/play-scene";
import {PlayState} from "./PlayState";
import {EventBus, UI_EVENTS, GAME_EVENTS} from "../ui/EventBus";

export class CountDownState implements State {

    private scene: PlayScene;

    constructor(scene: PlayScene) {
        this.scene = scene;
    }

    enter(stateMachine: StateMachineInterface): void {
        EventBus.emit(UI_EVENTS.SHOW_COUNTDOWN);
        EventBus.once(GAME_EVENTS.COUNTDOWN_COMPLETE, () => {
            this.scene.changeState(new PlayState(this.scene));
        });
    }

    exit(): void {
        EventBus.removeListener(GAME_EVENTS.COUNTDOWN_COMPLETE);
        EventBus.emit(UI_EVENTS.HIDE_COUNTDOWN);
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

}
