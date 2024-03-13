import {Scene} from "phaser";
import {TileScene} from "../scenes/tile-scene";

export interface State {

    enter(stateMachine: StateMachineInterface): void;

    updateState(stateMachine: StateMachineInterface): void;

    exit(): void
}

export interface StateMachineInterface {
    changeState(newState: State): void;

    getCurrentState(): State;

    updateStateMachine(): void;
}
