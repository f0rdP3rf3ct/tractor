export interface State {

    enter(stateMachine: StateMachineInterface): void;

    updateState(stateMachine: StateMachineInterface, delta: number): void;

    exit(): void
}

export interface StateMachineInterface {
    changeState(newState: State): void;
}
