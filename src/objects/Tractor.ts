import {Vehicle} from "./base/Vehicle";

export class Tractor extends Vehicle {

    static IDLE_FRAME = 'tractor_idle/idle_front_0001.png';

    public ANIM_KEY_MOVE_FRONT = 'tractor_move_front';
    public ANIM_KEY_MOVE_BACK = 'tractor_move_back';
    public ANIM_KEY_IDLE_FRONT = 'tractor_idle_front';
    public ANIM_KEY_IDLE_BACK = 'tractor_idle_back';

    static SPRITE_SHEET_PREFIX_TRACTOR_MOVE_FRONT = 'tractor_move/move_front_';
    static SPRITE_SHEET_PREFIX_TRACTOR_MOVE_BACK = 'tractor_move/move_back_';

    static SPRITE_SHEET_PREFIX_TRACTOR_IDLE_FRONT = 'tractor_idle/idle_front_';
    static SPRITE_SHEET_PREFIX_TRACTOR_IDLE_BACK = 'tractor_idle/idle_back_';


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, Vehicle.ATLAS_KEY, Tractor.IDLE_FRAME);
    }

    protected createAnimations() {
        this.anims.create({
            key: this.ANIM_KEY_MOVE_FRONT,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 6, zeroPad: 4, prefix: Tractor.SPRITE_SHEET_PREFIX_TRACTOR_MOVE_FRONT, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_MOVE_BACK,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 6, zeroPad: 4, prefix: Tractor.SPRITE_SHEET_PREFIX_TRACTOR_MOVE_BACK, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_IDLE_FRONT,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 1, zeroPad: 4, prefix: Tractor.SPRITE_SHEET_PREFIX_TRACTOR_IDLE_FRONT, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_IDLE_BACK,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 1, zeroPad: 4, prefix: Tractor.SPRITE_SHEET_PREFIX_TRACTOR_IDLE_BACK, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })
    }

}
