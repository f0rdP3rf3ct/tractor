import {LoadingScene} from "./loading-scene";
import Point = Phaser.Geom.Point;
import {Controls} from "../misc/Controls";

export class MenuScene extends Phaser.Scene {

    private logo: Phaser.GameObjects.Image;

    private buttonNewGame: Phaser.GameObjects.Image;

    private buttonControls: Phaser.GameObjects.Image;

    private selectionArrow: Phaser.GameObjects.Image;

    private controls: Controls;

    private buttonIsDown: boolean = false;

    private currentSelectionIndex = 0;

    private nextDelayStep: number = 0;

    private INPUT_AXIS_DELAY: number = 200;

    private selections = [
        {key: 'newGame', coord: new Point(292, 200), selected: true},
        {key: 'controls', coord: new Point(292, 352), selected: false}
    ];

    constructor() {
        super({key: 'MenuScene'});
    }

    create() {
        this.controls = new Controls(this);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image(0, 0, LoadingScene.UI_ATLAS_KEY, 'background.png').setOrigin(0, 0);
        this.logo = this.add.image(width * 0.5, 160, LoadingScene.UI_ATLAS_KEY, 'Logo.png');
        this.buttonNewGame = this.add.image(width * 0.5, 302, LoadingScene.UI_ATLAS_KEY, 'new_game.png');
        this.buttonControls = this.add.image(width * 0.5, 350, LoadingScene.UI_ATLAS_KEY, 'controls.png');

        this.selectionArrow = this.add.image(292, 346, LoadingScene.UI_ATLAS_KEY, 'selection_arrow.png');

        this.tweens.add({
            targets: this.logo,
            y: '+=20',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time: number, delta: number) {
        this.updateControls(time)
    }

    private updateAxisSelection(dir: number, time: number) {

        this.currentSelectionIndex += dir;

        if (this.currentSelectionIndex < 0 || this.currentSelectionIndex > this.selections.length - 1) {
            this.currentSelectionIndex = 0;
        }

        this.selections.forEach((selection, index) => {
            selection.selected = false;
            if (index === this.currentSelectionIndex) {
                selection.selected = true;
                this.selectionArrow.y = selection.coord.y;
            }
        })
    }

    updateControls(time: number) {
        this.controls.update();

        if (this.controls.noAxisIsPressed()) {
            this.buttonIsDown = false;
        }

        if (this.controls.up()) {
            if (!this.buttonIsDown) {
                this.updateAxisSelection(-1, time)
                this.buttonIsDown = true;
            }
        }

        if (this.controls.down()) {
            if (!this.buttonIsDown) {
                this.updateAxisSelection(1, time)
                this.buttonIsDown = true;
            }
        }
    }
}
