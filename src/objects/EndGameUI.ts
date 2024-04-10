import {Scene} from "phaser";
import Image = Phaser.GameObjects.Image;

export class EndGameUI extends Phaser.GameObjects.Container {

    static INGAME_UI_KEY = 'inGameUi';

    protected hitSpaceToStart: Image;

    protected starLeft: Image;

    protected starMiddle: Image;

    protected starRight: Image;

    protected harvester: Image;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);
        this.addChildren();
        this.createTweens();
    }

    protected addChildren() {
        const image = new Image(this.scene, 0, 0, EndGameUI.INGAME_UI_KEY, 'modal_background.png');

        const modalTitle = new Image(this.scene, 0, -140, EndGameUI.INGAME_UI_KEY, 'modal_title_victory.png');

        this.starLeft = new Image(this.scene, -80, -17, EndGameUI.INGAME_UI_KEY, 'modal_star_left.png');

        this.starMiddle = new Image(this.scene, 0, -35, EndGameUI.INGAME_UI_KEY, 'modal_star_middle.png');

        this.starRight = new Image(this.scene, 80, -17, EndGameUI.INGAME_UI_KEY, 'modal_star_right.png');

        this.harvester = new Image(this.scene, -10, 40, EndGameUI.INGAME_UI_KEY, 'modal_harverster.png')

        this.hitSpaceToStart = new Image(this.scene, 0, 160, EndGameUI.INGAME_UI_KEY, 'hit_space_to_start.png');


        this.add(image);
        this.add(modalTitle);

        this.add(this.starLeft);
        this.add(this.starMiddle);
        this.add(this.starRight);
        this.add(this.harvester);

        this.add(this.hitSpaceToStart);
    }

    protected createTweens() {

        this.starMiddle.scaleX = this.starMiddle.scaleY = 0;

        this.scene.tweens.chain({
            targets: this.starMiddle,
            tweens: [
                {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 300,
                    ease: 'quad.out'
                },
                {
                    scaleX: 1,
                    scaleY: 1.2,
                    duration: 300,
                    ease: 'bounce.out'
                },
            ],
            loop: -1,
            loopDelay: 300,
            // onComplete: () => this.openChest(chest, key)
        });


        this.scene.tweens.add({
            targets: this.hitSpaceToStart,
            alpha: 0,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        })
    }


}
