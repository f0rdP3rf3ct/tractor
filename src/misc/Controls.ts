import Button = Phaser.Input.Gamepad.Button;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import EventEmitter = Phaser.Events.EventEmitter;

export class Controls {

    static INPUT_ACTION_EVENT_KEY = 'inputAction';

    /*
    SPECIAL INPUT EVENTS
    */
    static INPUT_ACTION_EVENT_KEY_BUTTON_X = 'BUTTON_X';
    static INPUT_ACTION_EVENT_KEY_BUTTON_Y = 'BUTTON_Y';
    static INPUT_ACTION_EVENT_KEY_BUTTON_A = 'BUTTON_A';
    static INPUT_ACTION_EVENT_KEY_BUTTON_B = 'BUTTON_B';
    static INPUT_ACTION_EVENT_KEY_BUTTON_R = 'BUTTON_R1';
    static INPUT_ACTION_EVENT_KEY_BUTTON_L = 'BUTTON_L1';
    static INPUT_ACTION_EVENT_KEY_BUTTON_START = 'BUTTON_START';
    static INPUT_ACTION_EVENT_KEY_BUTTON_SELECT = 'BUTTON_SELECT';

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

    private keyboardCursors: CursorKeys;

    public inputActionEvent: EventEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.setupControlEvents();
        this.setupGamePadControls();
        this.setupKeyBoardControls();
    }

    private setupControlEvents() {
        this.inputActionEvent = new Phaser.Events.EventEmitter();
    }

    private setupGamePadControls() {
        debugger;
        /* connect gamepad if "connect" event is not fired */
        if (this.scene.input.gamepad.total) {
            this.pad = this.scene.input.gamepad.pad1;
        }

        /* used to connect gamepad */
        this.scene.input.gamepad.once('down', (pad: Phaser.Input.Gamepad.Gamepad, button: object, index: number) => {
            this.pad = pad;
        });

        /* catch actual buttons */
        this.scene.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad, button: Button, index: number) => {

            if (button.index === 3) {
                this.isButtonX = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_X);
            }

            if (button.index === 4) {
                this.isButtonY = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_Y);
            }

            if (button.index === 0) {
                this.isButtonA = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A);
            }

            if (button.index === 1) {
                this.isButtonB = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_B);
            }

            if (button.index === 7) {
                this.isButtonR = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_R);
            }

            if (button.index === 6) {
                this.isButtonL = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_L);
            }

            if (button.index === 11) {
                this.isButtonStart = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_START);
            }

            if (button.index === 10) {
                this.isButtonSelect = true;
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_SELECT);
            }
        });
    }

    private setupKeyBoardControls() {
        this.keyboardCursors = this.scene.input.keyboard.createCursorKeys()

        this.scene.input.keyboard.on('keydown', (event: any) => {
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
                this.inputActionEvent.emit(Controls.INPUT_ACTION_EVENT_KEY, Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A);
            }

        });
    }

    update() {
        this.isRight = this.isLeft = this.isUp = this.isDown = false;

        this.updateGamePadControls();
        this.updateKeyBoardControls();
    }

    private updateGamePadControls() {

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

    private updateKeyBoardControls() {

        if (this.keyboardCursors.up.isDown) {
            this.isUp = true;
        }

        if (this.keyboardCursors.down.isDown) {
            this.isDown = true;
        }

        if (this.keyboardCursors.left.isDown) {
            this.isLeft = true;
        }

        if (this.keyboardCursors.right.isDown) {
            this.isRight = true;
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
