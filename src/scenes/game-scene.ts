import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import * as Phaser from "phaser";
import Group = Phaser.Physics.Arcade.Group;
import Layer = Phaser.GameObjects.Layer;
import {PlayState} from "../states/PlayState";
import {MenuState} from "../states/MenuState";
import {GameOverState} from "../states/GameOverState";

export enum GAME_STATE_ENUM {
    'MENU_STATE' = 0,
    'PLAY_STATE' = 1,
    'GAME_OVER_STATE' = 2
}

export class GameScene extends Phaser.Scene implements StateMachineInterface {

    private currentGameState: State;

    private groundLayer: Layer;

    private lowerStructuresLayer: Layer;

    private movingObjectsLayer: Layer;

    private upperStructuresLayer: Layer;

    private collistionGroup: Group;

    private gameStates: State[];

    changeState(newState: State): void {
        if (this.currentGameState) {
            this.currentGameState.exit();
        }

        this.currentGameState = newState;

        if (this.currentGameState) {
            this.currentGameState.enter(this);
        }
    }

    getCurrentState(): State {
        return undefined;
    }

    updateStateMachine(): void {
    }

    create(): void {
        this.createMembers();
        this.createAudio();
        this.createGroups();
        this.createLayers();
        this.createGameStates();

        this.changeState(this.gameStates[GAME_STATE_ENUM.PLAY_STATE]);
    }

    createMembers() {
    }

    createAudio() {
    }

    createGroups() {
        this.collistionGroup = this.physics.add.group();
    }

    createLayers() {
        this.lowerStructuresLayer = this.add.layer();
        this.movingObjectsLayer = this.add.layer();
        this.upperStructuresLayer = this.add.layer();
    }

    createGameStates() {
        this.gameStates = [new MenuState(), new PlayState(), new GameOverState()]
    }

    update(time: number, delta: number) {
        if (this.currentGameState) {
            this.currentGameState.updateState(this, delta);
        }
    }

}
