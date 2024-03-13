import {Scene} from "phaser";

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
