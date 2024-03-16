import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {TileScene} from "../scenes/tile-scene";
import {InGameUI} from "../objects/InGameUI";
import {PlayState} from "./PlayState";
import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import TweenChainBuilderConfig = Phaser.Types.Tweens.TweenChainBuilderConfig;

export class CountDownState implements State {

    private scene: TileScene;

    private animContainer: Container;

    private currentAnimIndex: number = 0;

    constructor(scene: TileScene) {
        this.scene = scene;
    }

    enter(stateMachine: StateMachineInterface): void {
        this.createAssets();
        this.animateImageAt(this.currentAnimIndex);
    }

    exit(): void {
        this.animContainer.destroy();
    }

    updateState(stateMachine: StateMachineInterface, delta: number): void {
    }

    private createAssets() {
        const x = this.scene.cameras.main.width * 0.5;
        const y = this.scene.cameras.main.height * 0.5;

        this.animContainer = this.scene.add.container(x, y);

        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '3.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '2.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, '1.png'));
        this.animContainer.add(this.scene.add.image(0, 0, InGameUI.INGAME_UI_KEY, 'harvest_all.png'));

        // Hide all
        this.animContainer.getAll().forEach((child) => {
            if (child instanceof Image) {
                child.visible = false;
            }
        });
    }

    private getImageAt(index: number): Image | null {
        const target = this.animContainer.getAt(index);
        if (target instanceof Image) {
            return target;
        } else {
            console.log("not an image", target);
        }
        return null;
    }

    private animateImageAt(index: number): void {

        if (index === this.animContainer.getAll().length) {
            this.scene.changeState(new PlayState(this.scene));
            return;
        }

        const target = this.getImageAt(index);
        target.visible = true;
        target.alpha = 1;

        console.log("starting tween...", target);

        const config: TweenChainBuilderConfig = {
            targets: target,
            tweens: [
                {
                    targets: target,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 200,
                    ease: 'quad.out'
                },
                {
                    targets: target,
                    alpha: 0,
                    duration: 1000,
                    ease: 'linear'
                }
            ],
            onComplete: () => {
                this.currentAnimIndex++;
                this.animateImageAt(this.currentAnimIndex);
            }
        };

        this.scene.tweens.chain(config);
    }

}
