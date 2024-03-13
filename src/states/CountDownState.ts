import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {TileScene} from "../scenes/tile-scene";
import {LoadingScene} from "../scenes/loading-scene";
import {InGameUI} from "../objects/InGameUI";
import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;

export class CountDownState implements State {

    private scene: TileScene;

    private animContainer: Container;

    constructor(scene: TileScene) {
        this.scene = scene;
        this.createAssets();
    }

    enter(stateMachine: StateMachineInterface): void {
    }

    exit(): void {
    }

    updateState(stateMachine: StateMachineInterface): void {
    }

    private createAssets() {
        const x = this.scene.cameras.main.width * 0.5;
        const y = this.scene.cameras.main.height * 0.5;

        this.animContainer = this.scene.add.container(x, y);

        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '3.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '3.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '2.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '1.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, 'harvest_all.png'));

        this.animContainer.getAll().forEach((child) => {
            if (child instanceof Image) {
                child.visible = false;
            }
        });
    }

    private animateImage(): void {

    }

}
