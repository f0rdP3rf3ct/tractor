"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redhat = void 0;
class Redhat extends Phaser.GameObjects.Image {
    constructor(aParams) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
        this.initSprite();
        this.initPhysics();
        this.scene.add.existing(this);
    }
    initSprite() {
        this.setScale(0.5);
    }
    initPhysics() {
        this.scene.physics.world.enable(this);
        this.body.setVelocity(100, 200);
        this.body.setBounce(1, 1);
        this.body.setCollideWorldBounds(true);
    }
}
exports.Redhat = Redhat;
