import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import {IsoImage} from "../objects/isoImage";
import Image = Phaser.GameObjects.Image;
import Point = Phaser.Geom.Point;
import Sprite = Phaser.GameObjects.Sprite;

export class TileScene extends Phaser.Scene {

    private TILEMAP_SIZE = 40;
    private TILE_SIZE = 64;
    private PLAYER_START_POSITION = {x: 400, y: 300};

    // px / ms
    private MOVE_SPEED = 5;

    private SPRITE_SHEET_KEY = 'gameAssets';

    private playerPosition = {...this.PLAYER_START_POSITION}

    private cursors: CursorKeys;

    private moveDir = {x: 0, y: 0};

    private cartesianPoints: Phaser.Geom.Point[] = [];

    private logicPlayer: Phaser.GameObjects.Image;

    private renderPlayer: Phaser.GameObjects.Sprite;

    private groundLayer: Phaser.GameObjects.Layer;

    private renderObjectsLayer: Phaser.GameObjects.Layer;

    private collisionGroup: Phaser.Physics.Arcade.Group;

    private facing = 1;

    // Audio
    private audioTractorEngine: Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound;
    private audioHarversting: Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound;

    constructor() {
        super({key: 'TileScene'});
    }

    preload(): void {
        // debug
        this.load.image('cartDebugObject', '../assets/cartDebugObject.png');
        this.load.image('cartDebugPlayer', '../assets/cartDebugPlayer.png');

        // sprites
        this.load.atlas(this.SPRITE_SHEET_KEY, '../assets/spritesheets/gameAssets.png', '../assets/spritesheets/gameAssets.json');

        // audio
        this.load.audio('backgroundTheme', ['../assets/audio/backgroundTheme01.mp3', '../assets/audio/backgroundTheme01.ogg']);
        this.load.audio('tractorEngine', ['../assets/audio/tractorEngine01.mp3', '../assets/audio/tractorEngine01.ogg']);
        this.load.audio('harvesting', ['../assets/audio/harvesting01.mp3', '../assets/audio/harvesting01.ogg']);

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

        this.physics.add.overlap(this.logicPlayer, this.collisionGroup, this.handlePlayerCollision, null, this);
    }

    private createAnimations() {
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNames(this.SPRITE_SHEET_KEY, {start: 1, end: 6, zeroPad: 4, prefix: 'move/move', suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames(this.SPRITE_SHEET_KEY, {start: 1, end: 1, zeroPad: 4, prefix: 'idle/idle_front_', suffix: '.png'}),
            repeat: -1,
            frameRate: 12
        })
    }

    private createAudio() {
        const backgroundTheme = this.sound.add('backgroundTheme', {loop: true});
        backgroundTheme.play();

        this.audioTractorEngine = this.sound.add('tractorEngine', {loop: true});
        this.audioHarversting = this.sound.add('harvesting', {loop: false});
    }

    private handlePlayerCollision(player: any, object: any) {
        console.log('collision');
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
                this.audioHarversting.play()
            }
        }
    }


    private createCartesianTilePoints() {
        for (let x = 0; x <= this.TILEMAP_SIZE * this.TILE_SIZE; x += this.TILE_SIZE) {
            for (let y = 0; y <= this.TILEMAP_SIZE * this.TILE_SIZE; y += this.TILE_SIZE) {
                this.cartesianPoints.push(new Phaser.Geom.Point(x, y));
            }
        }
    }

    private createLayers() {
        this.groundLayer = this.add.layer();
        this.renderObjectsLayer = this.add.layer();
    }

    private updateCartesianTilePoints() {

        this.cartesianPoints.forEach((point) => {
            point.x += this.moveDir.x * this.MOVE_SPEED;
            point.y += this.moveDir.y * this.MOVE_SPEED;

            const resetPointMinXCart = 0;
            const resetPointMaxXCart = this.TILEMAP_SIZE * this.TILE_SIZE

            const resetPointMinYCart = 0;
            const resetPointMaxYCart = this.TILEMAP_SIZE * this.TILE_SIZE;


            if (point.x < resetPointMinXCart) {
                const offset = Math.floor(resetPointMinXCart - point.x);
                const newPointX = this.TILEMAP_SIZE * this.TILE_SIZE
                point.x = newPointX - offset;
            }

            if (point.x > resetPointMaxXCart) {
                const offset = Math.floor(resetPointMaxXCart - point.x);
                const newPointX = 0;
                point.x = newPointX - offset;
            }

            if (point.y < resetPointMinYCart) {
                const offset = Math.floor(resetPointMinYCart - point.y);
                const newPointY = this.TILEMAP_SIZE * this.TILE_SIZE;
                point.y = newPointY - offset;
            }

            if (point.y > resetPointMaxYCart) {
                const offset = Math.floor(resetPointMaxYCart - point.y);
                const newPointY = 0;
                point.y = newPointY - offset;
            }

        });
    }

    private updateLogic() {
        this.collisionGroup.getChildren().forEach((object) => {
            const coordinate = this.cartesianPoints[object.data.get('cartesianIndex')];
            const body = object.body as Phaser.Physics.Arcade.Body;
            body.x = coordinate.x;
            body.y = coordinate.y;
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
        this.cartesianPoints.forEach((point) => {
            const frame = Phaser.Math.RND.pick(['object/ground_2.png', 'object/ground_1.png']);
            const isoPoint = this.cartesianToIsometric(point);
            this.groundLayer.add(this.make.image({x: (isoPoint.x - 32), y: (isoPoint.y - 18), key: this.SPRITE_SHEET_KEY, frame: frame}))
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
        console.log(randomIndicesArray);
        return randomIndicesArray;
    }

    private addObjectTiles() {
        // Tiles to be populated...
        const objectPositionIndices = this.getRandomCartesianPoints();


        objectPositionIndices.forEach((index) => {
            // Create logic representation

            const logicObject = this.physics.add.image(this.cartesianPoints[index].x, this.cartesianPoints[index].y, 'cartDebugObject');
            logicObject.setDataEnabled();
            logicObject.data.set('cartesianIndex', index);
            const body = logicObject.body as Phaser.Physics.Arcade.Body;
            body.setSize(64, 64);
            logicObject.alpha = 0.2;
            this.collisionGroup.add(logicObject);

            // Create render representation
            const isoPoint = this.cartesianToIsometric(this.cartesianPoints[index]);
            const renderObject = new IsoImage({scene: this, x: (isoPoint.x - 32), y: (isoPoint.y - 32), texture: this.SPRITE_SHEET_KEY, frame: 'object/cornfield.png'}, index);
            this.renderObjectsLayer.add(renderObject);
        });
    }

    private addPlayer() {
        const ROW = 10;
        const DEPTH = 10;
        const cartPlayerPosition = this.cartesianPoints[(ROW * 40) + ROW + DEPTH];

        this.logicPlayer = this.physics.add.image(cartPlayerPosition.x + 32, cartPlayerPosition.y + 32, 'cartDebugPlayer');

        const body = this.logicPlayer.body as Phaser.Physics.Arcade.Body;
        body.setSize(64, 64);
//        body.x = cartPlayerPosition.x;
//        body.y = cartPlayerPosition.y;

        this.physics.add.existing(this.logicPlayer);

        const renderPlayerPosition = this.cartesianToIsometric(cartPlayerPosition);

        const x = (5 * 64) + (renderPlayerPosition.x);
        const y = (renderPlayerPosition.y - 18);

        this.renderPlayer = new Sprite(this, x, y, this.SPRITE_SHEET_KEY, 'idle/idle_front_0001.png');
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
                this.facing = -1;
                this.renderPlayer.scaleX = -1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.down.isDown) {
                this.moveDir.y = 1;
                this.facing = -1;
                this.renderPlayer.scaleX = -1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.left.isDown) {
                this.moveDir.x = 1;
                this.facing = 1;
                this.renderPlayer.scaleX = 1;

                this.renderPlayer.play('move', true);
            }

            if (this.cursors.right.isDown) {
                this.moveDir.x = -1;
                this.facing = 1;
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

    private cartesianToIsometric(cartPt: Phaser.Geom.Point) {
        const tempPt = new Phaser.Geom.Point(0, 0);
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
        this.cartesianPoints.forEach((point, i) => {
            // ground
            const isoPoint = this.cartesianToIsometric(point);
            const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;
            groundTile.x = (5 * 64) + isoPoint.x;
            groundTile.y = isoPoint.y;
        });

        // Update objects
        this.renderObjectsLayer.getChildren().forEach((object) => {
            const isoImage = object as IsoImage;

            // do not apply coordinates to the player
            if (isoImage.name === 'tractor') {
                return;
            }

            const isoPoint = this.cartesianToIsometric(this.cartesianPoints[isoImage.getCartesianPointIndex()]);
            isoImage.x = (5 * 64) + (isoPoint.x);
            isoImage.y = (isoPoint.y - 18);
        });

        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            {
            }
            this.renderPlayer.scaleX = this.facing + (0.05 * Math.sin(this.time.now / 1000));
            this.renderPlayer.scaleY = 1 + (0.12 * Math.sin(this.time.now / 1000));
        } else {
            this.renderPlayer.scaleX = this.facing + (0.05 * Math.sin(this.time.now / 100));
            this.renderPlayer.scaleY = 1 + (0.08 * Math.sin(this.time.now / 100));
        }

    }
}
