import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import {IsoImage} from "../objects/isoImage";
import Image = Phaser.GameObjects.Image;
import Sprite = Phaser.GameObjects.Sprite;
import Point = Phaser.Geom.Point;
import Layer = Phaser.GameObjects.Layer;
import Group = Phaser.Physics.Arcade.Group;
import HTML5AudioSound = Phaser.Sound.HTML5AudioSound;
import NoAudioSound = Phaser.Sound.NoAudioSound;
import WebAudioSound = Phaser.Sound.WebAudioSound;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;

export class TileScene extends Phaser.Scene {

    static SPRITE_SHEET_KEY = 'gameAssets';

    private TILEMAP_SIZE = 20;

    private TILE_SIZE = 64;

    // px / ms
    private MOVE_SPEED = 0.1;

    private cursors: CursorKeys;

    private moveDir = {x: 0, y: 0};

    private cartesianPoints: Point[] = [];

    private logicPlayer: Image;

    private renderPlayer: Sprite;

    private groundLayer: Layer;

    private renderObjectsLayer: Layer;

    private collisionGroup: Group;

    private playerFacingDir = 1;

    // Audio
    private audioTractorEngine: HTML5AudioSound | WebAudioSound | NoAudioSound;
    private audioHarvesting: HTML5AudioSound | WebAudioSound | NoAudioSound;

    // Particles
    private particleEmitterCrops: ParticleEmitter;

    constructor() {
        super({key: 'TileScene'});
    }

    preload(): void {
        // debug
        this.load.image('cartDebugObject', '../assets/cartDebugObject.png');
        this.load.image('cartDebugPlayer', '../assets/cartDebugPlayer.png');
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.collisionGroup = this.physics.add.group();

        this.createAnimations();
        this.createAudio();

        this.createCartesianTilePoints();
        this.updateCartesianTilePoints();

        this.createLayers();
        this.addGroundTiles();
        this.addObjectTiles();
        this.addPlayer();

        // add particle emitter
        this.particleEmitterCrops = this.add.particles(0, 0, 'gameAssets', {
            frame: 'object/cropParticle.png',
            lifespan: 500,
            speed: {min: 50, max: 100},
            scale: {start: 0.1, end: 1},
            rotate: {start: 0, end: 180},
            alpha: {start: 1, end: 0},
            gravityY: 4,
            emitting: false
        });

        this.physics.add.overlap(this.logicPlayer, this.collisionGroup, this.handlePlayerCollision, null, this);
    }

    private createAnimations() {
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNames(TileScene.SPRITE_SHEET_KEY, {start: 1, end: 6, zeroPad: 4, prefix: 'move/move', suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames(TileScene.SPRITE_SHEET_KEY, {start: 1, end: 1, zeroPad: 4, prefix: 'idle/idle_front_', suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })
    }

    private createAudio() {
        const backgroundTheme = this.sound.add('backgroundTheme', {loop: true});
        backgroundTheme.play();

        this.audioTractorEngine = this.sound.add('tractorEngine', {loop: true});
        this.audioHarvesting = this.sound.add('harvesting', {loop: false});
    }

    private handlePlayerCollision(player: any, object: any) {
        const index = object.data.get('cartesianIndex');
        if (object) {
            object.destroy();
            const displayObject = this.renderObjectsLayer.getChildren().filter((child: IsoImage) => {
                if (child.name === 'tractor') {
                    return false;
                }

                return child.getCartesianPointIndex() === index;
            });
            if (displayObject) {
                displayObject[0].destroy()
                this.audioHarvesting.play();
                const treatAsImage = displayObject[0] as Image;
                this.particleEmitterCrops.emitParticleAt(treatAsImage.x, treatAsImage.y, 10);
            }
        }
    }

    private createCartesianTilePoints() {
        for (let x = 0; x <= this.TILEMAP_SIZE; x++) {
            for (let y = 0; y <= this.TILEMAP_SIZE; y++) {
                this.cartesianPoints.push(new Point(x, y));
            }
        }
    }

    private createLayers() {
        this.groundLayer = this.add.layer();
        this.renderObjectsLayer = this.add.layer();
    }

    private updateCartesianTilePoints() {

        this.cartesianPoints.forEach((inPoint) => {
            const point = inPoint;

            point.x += (this.moveDir.x * this.MOVE_SPEED);
            point.y += (this.moveDir.y * this.MOVE_SPEED);

            const resetPointMinXCart = 0;
            const resetPointMaxXCart = this.TILEMAP_SIZE

            const resetPointMinYCart = 0;
            const resetPointMaxYCart = this.TILEMAP_SIZE;

            if (point.x < resetPointMinXCart) {
                const offset = resetPointMinXCart - point.x;
                const newPointX = this.TILEMAP_SIZE;
                point.x = newPointX - offset;
            }

            if (point.x > resetPointMaxXCart) {
                const offset = resetPointMaxXCart - point.x;
                const newPointX = 0;
                point.x = newPointX - offset;
            }

            if (point.y < resetPointMinYCart) {
                const offset = resetPointMinYCart - point.y;
                const newPointY = this.TILEMAP_SIZE;
                point.y = newPointY - offset;
            }

            if (point.y > resetPointMaxYCart) {
                const offset = resetPointMaxYCart - point.y;
                const newPointY = 0;
                point.y = newPointY - offset;
            }

        });
    }

    private getCartTilePosition(point: Point) {
        return new Point(point.x * this.TILE_SIZE, point.y * this.TILE_SIZE);
    }

    private updateLogic() {
        this.collisionGroup.getChildren().forEach((object) => {
            const cartTilePosition = this.getCartTilePosition(this.cartesianPoints[object.data.get('cartesianIndex')]);
            const body = object.body as Phaser.Physics.Arcade.Body;
            body.x = cartTilePosition.x;
            body.y = cartTilePosition.y;
        });
    }

    private updateAudio() {
        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            this.audioTractorEngine.setVolume(0.3);
            this.audioTractorEngine.applyConfig();
        } else {
            this.audioTractorEngine.setVolume(0.7);
            this.audioTractorEngine.applyConfig();
        }

        if (!this.audioTractorEngine.isPlaying) {
            this.audioTractorEngine.play();
        }

    }

    private addGroundTiles() {
        this.cartesianPoints.forEach((inPoint) => {
            const point = this.getCartTilePosition(inPoint);
            const frame = Phaser.Math.RND.pick(['object/ground_2.png', 'object/ground_1.png']);
            const isoPoint = this.cartesianToIsometric(point);
            this.groundLayer.add(this.make.image({x: (isoPoint.x - 32), y: (isoPoint.y - 18), key: TileScene.SPRITE_SHEET_KEY, frame: frame}))
        });
    }

    /**
     * Returns a random set of cartesian points
     * @private
     */
    private getRandomCartesianPoints(): number[] {
        const seed = (this.TILEMAP_SIZE * this.TILEMAP_SIZE).toString();
        Phaser.Math.RND.sow([seed]);

        const numberOfRandomIndices = 1200;
        const originalArray = this.cartesianPoints.slice();
        const randomIndicesArray: number[] = [];

        for (let i = 0; i < numberOfRandomIndices; i++) {
            const randomIndex = Phaser.Math.RND.integerInRange(0, originalArray.length - 1);
            originalArray.splice(randomIndex, 1);
            if (randomIndicesArray.indexOf(randomIndex) === -1) {
                randomIndicesArray.push(randomIndex);
            }
        }

        return randomIndicesArray;
    }

    private addObjectTiles() {
        // Tiles to be populated...
        const objectPositionIndices = this.getRandomCartesianPoints();

        objectPositionIndices.forEach((index) => {
            // Create logic representation
            const point = this.getCartTilePosition(this.cartesianPoints[index]);
            const logicObject = this.physics.add.image(point.x, point.y, 'cartDebugObject');
            logicObject.setDataEnabled();
            logicObject.data.set('cartesianIndex', index);
            const body = logicObject.body as Phaser.Physics.Arcade.Body;
            body.setSize(64, 64);
            logicObject.alpha = 0;
            this.collisionGroup.add(logicObject);

            // Create render representation
            const isoPoint = this.cartesianToIsometric(point);
            const renderObject = new IsoImage({scene: this, x: (isoPoint.x - 32), y: (isoPoint.y - 32), texture: TileScene.SPRITE_SHEET_KEY, frame: 'object/cornfield.png'}, index);
            this.renderObjectsLayer.add(renderObject);
        });

    }

    private getTileCenter(): Point {
        let totalX = 0;
        let totalY = 0;

        for (var i = 0; i < this.cartesianPoints.length; i++) {
            totalX += this.cartesianPoints[i].x;
            totalY += this.cartesianPoints[i].y;
        }

        const averageX = totalX / this.cartesianPoints.length;
        const averageY = totalY / this.cartesianPoints.length;

        return new Point(averageX, averageY);
    }

    private addPlayer() {
        const cartPlayerPosition = this.getCartTilePosition(this.getTileCenter());

        this.logicPlayer = this.physics.add.image(cartPlayerPosition.x, cartPlayerPosition.y, 'cartDebugPlayer');
        this.logicPlayer.alpha = 0.2;

        const body = this.logicPlayer.body as Phaser.Physics.Arcade.Body;
        body.setSize(64, 64);

        this.physics.add.existing(this.logicPlayer);

        const renderPlayerPosition = this.cartesianToIsometric(cartPlayerPosition);

        const x = 400 + renderPlayerPosition.x;
        const y = (renderPlayerPosition.y - 18);

        this.renderPlayer = new Sprite(this, x, y, TileScene.SPRITE_SHEET_KEY, 'idle/idle_front_0001.png');
        this.renderPlayer.name = 'tractor';

        // this.renderPlayer = new IsoImage({scene: this, x: (5 * 64) + (renderPlayerPosition.x), y: (renderPlayerPosition.y - 18), texture: 'tractor'}, -1);
        this.renderObjectsLayer.add(this.renderPlayer);
    }


    private updateInput() {

        if (this.cursors) {
            this.moveDir.x = 0;
            this.moveDir.y = 0;

            if (this.cursors.up.isDown) {
                this.moveDir.y = -1;
                this.playerFacingDir = -1;
                this.renderPlayer.scaleX = -1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.down.isDown) {
                this.moveDir.y = 1;
                this.playerFacingDir = -1;
                this.renderPlayer.scaleX = -1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.left.isDown) {
                this.moveDir.x = 1;
                this.playerFacingDir = 1;
                this.renderPlayer.scaleX = 1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.right.isDown) {
                this.moveDir.x = -1;
                this.playerFacingDir = 1;
                this.renderPlayer.scaleX = 1;

                this.renderPlayer.play('move', true);
            }

            if (this.moveDir.x === 0 && this.moveDir.y === 0) {
                this.renderPlayer.play('idle', true);
            }
        }
    }

    update(time: number, delta: number) {
        this.updateInput();
        this.updateCartesianTilePoints();
        this.updateLogic();
        this.updateAudio();

        // this.debugPoints();
        this.depthSortIsometrics();
        this.renderIsometric(delta);
    }

    private cartesianToIsometric(cartPt: Point) {
        const tempPt = new Point(0, 0);
        tempPt.x = Math.floor((cartPt.x - cartPt.y) / 2);
        tempPt.y = Math.floor((cartPt.x + cartPt.y) / 4);
        return tempPt;
    }


    private depthSortIsometrics() {
        this.renderObjectsLayer.sort('y', function (a: any, b: any) {
            if (a.y < b.y) {
                return -1;
            }
            if (a.y > b.y) {
                return 1;
            }
            return 0;
        });

    };

    private renderIsometric(delta: number) {
        // this.graphics.clear();
        this.cartesianPoints.forEach((inPoint, i) => {
            const point = this.getCartTilePosition(inPoint);
            // ground
            const isoPoint = this.cartesianToIsometric(point);
            const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;
            // groundTile.x = (5 * 64) + isoPoint.x;
            groundTile.x = 400 + isoPoint.x;
            groundTile.y = isoPoint.y;
        });

        // Update objects
        this.renderObjectsLayer.getChildren().forEach((object) => {
            const isoImage = object as IsoImage;

            // do not apply coordinates to the player
            if (isoImage.name === 'tractor') {
                return;
            }

            const point = this.getCartTilePosition(this.cartesianPoints[isoImage.getCartesianPointIndex()]);

            const isoPoint = this.cartesianToIsometric(point);
            isoImage.x = 400 + isoPoint.x;
            isoImage.y = (isoPoint.y - 18);
        });

        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            this.renderPlayer.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 1000));
            this.renderPlayer.scaleY = 1 + (0.12 * Math.sin(this.time.now / 1000));
        } else {
            this.renderPlayer.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 100));
            this.renderPlayer.scaleY = 1 + (0.08 * Math.sin(this.time.now / 100));
        }

    }
}
