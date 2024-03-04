import {Vehicle} from "./base/Vehicle";

export class Harvester extends Vehicle {

    static IDLE_FRAME = 'harvester_idle/idle_front_0001.png';

    public ANIM_KEY_MOVE_FRONT = 'harvester_move_front';
    public ANIM_KEY_MOVE_BACK = 'harvester_move_back';
    public ANIM_KEY_IDLE_FRONT = 'harvester_idle_front';
    public ANIM_KEY_IDLE_BACK = 'harvester_idle_back';

    static SPRITE_SHEET_PREFIX_HARVESTER_MOVE_FRONT = 'harvester_move/move_front_';
    static SPRITE_SHEET_PREFIX_HARVESTER_MOVE_BACK = 'harvester_move/move_back_';

    static SPRITE_SHEET_PREFIX_HARVESTER_IDLE_FRONT = 'harvester_idle/idle_front_';
    static SPRITE_SHEET_PREFIX_HARVESTER_IDLE_BACK = 'harvester_idle/idle_back_';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, Vehicle.ATLAS_KEY, Harvester.IDLE_FRAME);
    }

    protected createAnimations() {
        this.anims.create({
            key: this.ANIM_KEY_MOVE_FRONT,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 6, zeroPad: 4, prefix: Harvester.SPRITE_SHEET_PREFIX_HARVESTER_MOVE_FRONT, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_MOVE_BACK,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 6, zeroPad: 4, prefix: Harvester.SPRITE_SHEET_PREFIX_HARVESTER_MOVE_BACK, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_IDLE_FRONT,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 1, zeroPad: 4, prefix: Harvester.SPRITE_SHEET_PREFIX_HARVESTER_IDLE_FRONT, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: this.ANIM_KEY_IDLE_BACK,
            frames: this.anims.generateFrameNames(Vehicle.ATLAS_KEY, {start: 1, end: 1, zeroPad: 4, prefix: Harvester.SPRITE_SHEET_PREFIX_HARVESTER_IDLE_BACK, suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })
    }

}
