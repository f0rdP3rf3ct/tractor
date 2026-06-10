import Point = Phaser.Geom.Point;

export class PlayerInputState {
    moveDir: Point = new Point(0, 0);
    lastDirection: string = 'right';
    facingDir: number = 1;
}
