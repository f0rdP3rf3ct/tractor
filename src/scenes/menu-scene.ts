import {LoadingScene} from "./loading-scene";
import Point = Phaser.Geom.Point;
import {Controls} from "../misc/Controls";

export class MenuScene extends Phaser.Scene {

    private logo: Phaser.GameObjects.Image;

    private buttonNewGameImage: Phaser.GameObjects.Image;

    private buttonControlsImage: Phaser.GameObjects.Image;

    private selectionArrowImage: Phaser.GameObjects.Image;

    private controls: Controls;

    private buttonIsDown: boolean = false;

    private currentSelectionIndex = 0;

    private selections = [
        {key: 'newGame', coord: new Point(292, 302), selected: true},
        {key: 'controls', coord: new Point(292, 350), selected: false}
    ];

    constructor() {
        super({key: 'MenuScene'});
    }

    create() {
        this.controls = new Controls(this);

        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {

            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    this.scene.start('TileScene');
                    break;
            }

        });

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image(0, 0, LoadingScene.UI_ATLAS_KEY, 'background.png').setOrigin(0, 0);
        this.logo = this.add.image(width * 0.5, 160, LoadingScene.UI_ATLAS_KEY, 'Logo.png');
        this.buttonNewGameImage = this.add.image(width * 0.5, 302, LoadingScene.UI_ATLAS_KEY, 'new_game.png');
        this.buttonControlsImage = this.add.image(width * 0.5, 350, LoadingScene.UI_ATLAS_KEY, 'controls.png');

        this.selectionArrowImage = this.add.image(292, 302, LoadingScene.UI_ATLAS_KEY, 'selection_arrow.png');

        this.tweens.add({
            targets: this.logo,
            y: '+=20',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.updateAxisSelection(0);
    }

    update(time: number, delta: number) {
        this.updateControls(time)
    }

    private updateAxisSelection(dir: number) {

        this.currentSelectionIndex += dir;

        if (this.currentSelectionIndex < 0) {
            this.currentSelectionIndex = this.selections.length - 1;
        }

        if (this.currentSelectionIndex > this.selections.length - 1) {
            this.currentSelectionIndex = 0;
        }

        this.selections.forEach((selection, index) => {
            selection.selected = false;
            if (index === this.currentSelectionIndex) {
                selection.selected = true;
                this.selectionArrowImage.y = selection.coord.y;
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
                this.updateAxisSelection(-1)
                this.buttonIsDown = true;
            }
        }

        if (this.controls.down()) {
            if (!this.buttonIsDown) {
                this.updateAxisSelection(1)
                this.buttonIsDown = true;
            }
        }
    }
}
