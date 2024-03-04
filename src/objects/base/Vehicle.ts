export abstract class Vehicle extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    static ATLAS_KEY = 'gameAssets';

    public ANIM_KEY_MOVE_FRONT = '';
    public ANIM_KEY_MOVE_BACK = '';
    public ANIM_KEY_IDLE_FRONT = '';
    public ANIM_KEY_IDLE_BACK = '';


    protected constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number) {
        super(scene, x, y, texture, frame);
        this.name = 'player';
        this.createAnimations();
    }

    protected createAnimations() {
    }

}
