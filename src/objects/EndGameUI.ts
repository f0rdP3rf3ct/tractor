import {Scene} from "phaser";
import Image = Phaser.GameObjects.Image;

export class EndGameUI extends Phaser.GameObjects.Container {

    static INGAME_UI_KEY = 'inGameUi';

    protected hitSpaceToStart: Image;

    protected starLeft: Image;

    protected starMiddle: Image;

    protected starRight: Image;

    protected harvester: Image;

    private readonly onCoinPlay: () => void;

    constructor(scene: Scene, x: number, y: number, onCoinPlay: () => void) {
        super(scene, x, y, []);
        this.onCoinPlay = onCoinPlay;
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


        this.add(image);
        this.add(modalTitle);

        this.add(this.starLeft);
        this.add(this.starMiddle);
        this.add(this.starRight);
        this.add(this.harvester);
    }

    protected playCoinAudio() {
        this.onCoinPlay();
    }

    protected startMiddleStarTween() {
        this.scene.tweens.chain({
            targets: this.starMiddle,
            tweens: [
                {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'quad.out'
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'bounce.out'
                },
            ],
            onComplete: () => this.startRightStarTween()
        });
    }

    protected startRightStarTween() {
        this.scene.tweens.chain({
            targets: this.starRight,
            tweens: [
                {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'quad.out'
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'bounce.out'
                },
            ]
        });
    }

    protected createTweens() {

        this.starLeft.scaleX = this.starLeft.scaleY = 0;
        this.starMiddle.scaleX = this.starMiddle.scaleY = 0;
        this.starRight.scaleX = this.starRight.scaleY = 0;

        this.scene.tweens.chain({
            targets: this.starLeft,
            tweens: [
                {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'quad.out'
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'bounce.out'
                },
            ],
            onActive: () => this.playCoinAudio(),
            onComplete: () => this.startMiddleStarTween()
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
