import Button = Phaser.Input.Gamepad.Button;

export class Controls {

    private scene: Phaser.Scene;

    private pad: Phaser.Input.Gamepad.Gamepad;

    private isUp: boolean = false;
    private isDown: boolean = false;
    private isLeft: boolean = false;
    private isRight: boolean = false;

    private isButtonX: boolean = false;
    private isButtonY: boolean = false;
    private isButtonA: boolean = false;
    private isButtonB: boolean = false;

    private isButtonR: boolean = false;
    private isButtonL: boolean = false;

    private isButtonStart: boolean = false;
    private isButtonSelect: boolean = false;


    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        if (this.scene.input.gamepad.total) {
            this.pad = this.scene.input.gamepad.pad1;
        }

        this.scene.input.gamepad.once('down', (pad: Phaser.Input.Gamepad.Gamepad, button: object, index: number) => {
            this.pad = pad;
            console.log('button ' + button + ' down');
        });

        this.scene.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad, button: Button, index: number) => {

            if (button.index === 3) {
                this.isButtonX = true;
            }

            if (button.index === 4) {
                this.isButtonY = true;
            }

            if (button.index === 0) {
                this.isButtonA = true;
            }

            if (button.index === 1) {
                this.isButtonB = true;
            }

            if (button.index === 7) {
                this.isButtonR = true;
            }

            if (button.index === 6) {
                this.isButtonL = true;
            }

            if (button.index === 11) {
                this.isButtonStart = true;
            }

            if (button.index === 10) {
                this.isButtonSelect = true;
            }
        });

    }

    update() {
        this.isRight = this.isLeft = this.isUp = this.isDown = false;

        // gamePad controls
        if (this.pad) {

            if (this.pad.axes.length) {
                const axisH = this.pad.axes[0].getValue();
                const axisV = this.pad.axes[1].getValue();

                this.isRight = axisH == 1;
                this.isLeft = axisH == -1;
                this.isUp = axisV == -1;
                this.isDown = axisV == 1;
            }
        }
    }

    public noAxisIsPressed(): boolean {
        return !this.isUp && !this.isDown && !this.isLeft && !this.isRight;
    }

    public up(): boolean {
        return this.isUp;
    }

    public down(): boolean {
        return this.isDown;
    }

    public left(): boolean {
        return this.isLeft;
    }

    public right(): boolean {
        return this.isRight;
    }

    public buttonA(): boolean {
        return this.isButtonA;
    }

    public buttonB(): boolean {
        return this.isButtonB;
    }

    public buttonX(): boolean {
        return this.isButtonX;
    }

    public buttonY(): boolean {
        return this.isButtonY;
    }

    public buttonStart(): boolean {
        return this.isButtonStart;
    }

    public buttonSelect(): boolean {
        return this.isButtonSelect;
    }
}
