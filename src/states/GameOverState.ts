import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {Controls} from "../misc/Controls";
import {PlayScene} from "../scenes/play-scene";
import {EventBus, UI_EVENTS, GAME_EVENTS} from "../ui/EventBus";

export class GameOverState implements State {

    private scene: PlayScene;

    private controls: Controls;

    private _transitioning = false;

    constructor(scene: PlayScene) {
        this.scene = scene;
        this.controls = new Controls(this.scene);
    }

    enter(stateMachine: StateMachineInterface): void {
        this._transitioning = false;
        EventBus.emit(UI_EVENTS.SHOW_VICTORY);
        this.scene.playAudioCoin();
        EventBus.once(GAME_EVENTS.PLAY_AGAIN, () => {
            if (this._transitioning) return;
            this._transitioning = true;
            this.scene.shutDown();
            this.scene.scene.start('MenuScene');
        });
        this.addEventListeners();
    }

    exit(): void {
        EventBus.removeListener(GAME_EVENTS.PLAY_AGAIN);
        EventBus.emit(UI_EVENTS.HIDE_VICTORY);
        this.removeEventListeners();
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

    private addEventListeners(): void {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    EventBus.emit(GAME_EVENTS.PLAY_AGAIN);
                    break;
            }
        })
    }

    private removeEventListeners(): void {
        this.controls.inputActionEvent.removeListener(Controls.INPUT_ACTION_EVENT_KEY);
    }
}
