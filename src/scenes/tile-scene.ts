import Image = Phaser.GameObjects.Image;
import Point = Phaser.Geom.Point;
import Layer = Phaser.GameObjects.Layer;
import Group = Phaser.Physics.Arcade.Group;
import HTML5AudioSound = Phaser.Sound.HTML5AudioSound;
import NoAudioSound = Phaser.Sound.NoAudioSound;
import WebAudioSound = Phaser.Sound.WebAudioSound;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {IsoImage} from "../objects/isoImage";
import {Controls} from "../misc/Controls";
import {Tractor} from "../objects/Tractor";
import {Vehicle} from "../objects/base/Vehicle";
import {Harvester} from "../objects/Harvester";
import {CartesianHelper} from "../misc/CartesianHelper";

export class TileScene extends Phaser.Scene {

    static GAME_ATLAS_KEY = 'gameAssets';

    private TILEMAP_SIZE = 40;

    private TILE_SIZE = 64;

    private ISO_TILE_WIDTH = 64;

    private ISO_TILE_HEIGHT = 32;

    private INNER_MOST_BLANKS_TILE_SIZE = 9;

    private MOVE_SPEED = 0.1;

    private availableVehicles: Vehicle[] = [];

    private selectedPlayerModelIndex = 1;

    private isoGridHeight: number;

    private isoGridWidth: number;

    /**
     * Point to position isogrid in the center of the screen
     * @private
     */
    private isoGridGlobalCenter: Point;

    private moveDir = {x: 0, y: 0};

    private cartesianPoints: Point[] = [];

    private logicPlayer: Image;

    private renderPlayerVehicle: Vehicle;

    private groundLayer: Layer;

    private renderObjectsLayer: Layer;

    private collisionGroup: Group;

    private playerFacingDir = 1;

    // Audio
    private audioEngine: HTML5AudioSound | WebAudioSound | NoAudioSound;

    private audioHarvesting: HTML5AudioSound | WebAudioSound | NoAudioSound;

    private audioHonk: HTML5AudioSound | WebAudioSound | NoAudioSound;

    // Particles
    private particleEmitterCrops: ParticleEmitter;

    private controls: Controls;

    private cartesianHelper: CartesianHelper;

    constructor() {
        super({key: 'TileScene'});
    }

    preload(): void {
        // debug
        this.load.image('cartDebugObject', '../assets/cartDebugObject.png');
        this.load.image('cartDebugPlayer', '../assets/cartDebugPlayer.png');
    }

    create(): void {
        this.controls = new Controls(this);
        this.cartesianHelper = new CartesianHelper();

        this.collisionGroup = this.physics.add.group();

        this.isoGridWidth = this.TILEMAP_SIZE * this.ISO_TILE_WIDTH;
        this.isoGridHeight = this.TILEMAP_SIZE * this.ISO_TILE_HEIGHT;

        this.isoGridGlobalCenter = new Point((this.cameras.main.width * 0.5), (this.cameras.main.height * 0.5) - (this.isoGridHeight * 0.5));

        this.createAudio();

        this.createCartesianTilePoints();
        this.updateCartesianTilePoints();

        this.createLayers();
        this.addGroundTiles();
        this.addObjectTiles();

        this.addPhysicsPlayer();
        this.createVehicles();

        this.addParticles();
        this.addEventListeners();

        this.physics.add.overlap(this.logicPlayer, this.collisionGroup, this.handlePlayerCollision, null, this);
    }

    private createAudio() {
        const backgroundTheme = this.sound.add('backgroundTheme', {loop: true});
        backgroundTheme.play();

        this.audioEngine = this.sound.add('tractorEngine', {loop: true});
        this.audioHarvesting = this.sound.add('harvesting', {loop: false});
        this.audioHonk = this.sound.add('honk', {loop: false});
    }

    private handlePlayerCollision(player: any, object: any) {

        const index = object.data.get('cartesianIndex');

        if (object) {
            object.destroy();

            const displayObject = this.renderObjectsLayer.getChildren().filter((child: IsoImage) => {
                if (child.name === 'player') {
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
        this.cartesianPoints = this.cartesianHelper.createCartesianPoints(this.TILEMAP_SIZE);
    }

    private createVehicles() {
        const centerPoint = this.cartesianHelper.getCenterOfPoints(this.cartesianPoints);
        const cartPlayerPosition = this.cartesianHelper.getCartesianTilePosition(centerPoint, this.TILE_SIZE);
        const renderPlayerPosition = this.cartesianToIsometric(cartPlayerPosition);

        const x = renderPlayerPosition.x;
        const y = renderPlayerPosition.y - this.ISO_TILE_HEIGHT * 0.5;

        this.availableVehicles = [new Tractor(this, x, y), new Harvester(this, x, y)];

        this.availableVehicles.forEach((vehicle) => {
            this.add.existing(vehicle);
            this.renderObjectsLayer.add(vehicle);
        });

        this.cyclePlayerVehicle(0);
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

    private updateLogic() {
        this.collisionGroup.getChildren().forEach((object) => {
            const cartTilePosition = this.cartesianHelper.getCartesianTilePosition(this.cartesianPoints[object.data.get('cartesianIndex')], this.TILE_SIZE);
            const body = object.body as Phaser.Physics.Arcade.Body;
            body.x = cartTilePosition.x;
            body.y = cartTilePosition.y;
        });
    }

    private updateAudio() {
        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            this.audioEngine.setVolume(0.3);
            this.audioEngine.applyConfig();
        } else {
            this.audioEngine.setVolume(0.7);
            this.audioEngine.applyConfig();
        }

        if (!this.audioEngine.isPlaying) {
            this.audioEngine.play();
        }
    }

    private addGroundTiles() {
        this.cartesianPoints.forEach((inPoint) => {
            const point = this.cartesianHelper.getCartesianTilePosition(inPoint, this.TILE_SIZE);
            const frame = Phaser.Math.RND.pick(['object/ground_2.png', 'object/ground_1.png']);
            const isoPoint = this.cartesianToIsometric(point);
            this.groundLayer.add(this.make.image({
                x: (isoPoint.x - this.ISO_TILE_WIDTH * 0.5),
                y: (isoPoint.y - this.ISO_TILE_HEIGHT * 0.5),
                key: TileScene.GAME_ATLAS_KEY,
                frame: frame
            }))
        });
    }

    private addObjectTiles() {

        const innerMostPoints = this.cartesianHelper.getInnerMostCartesianPoints(this.TILEMAP_SIZE, this.INNER_MOST_BLANKS_TILE_SIZE);

        this.cartesianPoints.forEach((inPoint, index) => {

            const isInnerMost = innerMostPoints.some((innerPoint) => {
                return innerPoint.x === inPoint.x && innerPoint.y === inPoint.y;
            });

            if (isInnerMost) {
                return;
            }

            // Create logic representation
            const point = this.cartesianHelper.getCartesianTilePosition(this.cartesianPoints[index], this.TILE_SIZE);
            const logicObject = this.physics.add.image(point.x, point.y, 'cartDebugObject');
            logicObject.setDataEnabled();
            logicObject.data.set('cartesianIndex', index);

            const body = logicObject.body as Phaser.Physics.Arcade.Body;
            body.setSize(64, 64);
            logicObject.alpha = 0;
            this.collisionGroup.add(logicObject);

            // Create render representation
            const isoPoint = this.cartesianToIsometric(point);
            const renderObject = new IsoImage({
                scene: this,
                x: (isoPoint.x - 32),
                y: (isoPoint.y - 32),
                texture: TileScene.GAME_ATLAS_KEY,
                frame: 'object/cornfield.png'
            }, index);
            this.renderObjectsLayer.add(renderObject);
        });

    }

    private addPhysicsPlayer() {
        const centerPoint = this.cartesianHelper.getCenterOfPoints(this.cartesianPoints);
        const cartPlayerPosition = this.cartesianHelper.getCartesianTilePosition(centerPoint, this.TILE_SIZE);

        this.logicPlayer = this.physics.add.image(cartPlayerPosition.x, cartPlayerPosition.y, 'cartDebugPlayer');
        this.logicPlayer.alpha = 0.2;

        this.physics.add.existing(this.logicPlayer);
    }

    private addParticles() {
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
    }

    private addEventListeners() {
        this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
            switch (key) {
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_L:
                    this.cyclePlayerVehicle(-1);
                    break;
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_R:
                    this.cyclePlayerVehicle(1);
                    break;
                case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
                    if (!this.audioHonk.isPlaying) {
                        this.audioHonk.play();
                    }
                    break;
            }
        })
    }

    /**
     * @private
     * @param dir
     */
    private cyclePlayerVehicle(dir: number) {
        const nextIndex = this.selectedPlayerModelIndex + dir;

        if (nextIndex > this.availableVehicles.length - 1) {
            this.selectedPlayerModelIndex = 0;
        } else if (nextIndex < 0) {
            this.selectedPlayerModelIndex = this.availableVehicles.length - 1;
        } else {
            this.selectedPlayerModelIndex = nextIndex;
        }

        this.availableVehicles.forEach((vehicle) => {
            vehicle.visible = false;
        })

        const body = this.logicPlayer.body as Phaser.Physics.Arcade.Body;
        const selectedVehicle = this.availableVehicles[this.selectedPlayerModelIndex];

        if (selectedVehicle instanceof Tractor) {
            body.setSize(64, 64);
        }

        if (selectedVehicle instanceof Harvester) {
            body.setSize(128, 128);
        }
        this.renderPlayerVehicle = selectedVehicle;
        this.renderPlayerVehicle.visible = true;
    }


    private updateInput() {

        this.moveDir.x = 0;
        this.moveDir.y = 0;
        let inputLocked = false;

        if (this.controls.up() && !inputLocked) {
            this.moveDir.y = -1;
            this.playerFacingDir = -1;

            this.renderPlayerVehicle.scaleX = -1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_FRONT, true);

            inputLocked = true;
        }

        if (this.controls.down() && !inputLocked) {
            this.moveDir.y = 1;
            this.playerFacingDir = -1;

            this.renderPlayerVehicle.scaleX = -1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_BACK, true);

            inputLocked = true;
        }

        if (this.controls.left() && !inputLocked) {
            this.moveDir.x = 1;
            this.playerFacingDir = 1;

            this.renderPlayerVehicle.scaleX = 1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_BACK, true);

            inputLocked = true;
        }

        if (this.controls.right() && !inputLocked) {
            this.moveDir.x = -1;
            this.playerFacingDir = 1;

            this.renderPlayerVehicle.scaleX = 1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_FRONT, true);

            inputLocked = true;
        }

        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            if (this.playerFacingDir === 1) {
                this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_IDLE_FRONT, true);
            }

            if (this.playerFacingDir === -1) {
                this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_IDLE_BACK, true);
            }
        }
    }

    update(time: number, delta: number) {

        if (this.controls) {
            this.controls.update();
        }

        this.updateInput();
        this.updateCartesianTilePoints();
        this.updateLogic();
        this.updateAudio();

        // this.debugPoints();
        this.depthSortIsometrics();
        this.renderIsometric(delta);
        this.updateAnimations();
    }

    private cartesianToIsometric(cartPt: Point) {
        const tempPt = new Point(this.isoGridGlobalCenter.x, this.isoGridGlobalCenter.y);
        tempPt.x += (Math.floor((cartPt.x - cartPt.y) / 2));
        tempPt.y += (Math.floor((cartPt.x + cartPt.y) / 4));
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
            const point = this.cartesianHelper.getCartesianTilePosition(inPoint, this.TILE_SIZE);
            // ground
            const isoPoint = this.cartesianToIsometric(point);
            const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;
            // groundTile.x = (5 * 64) + isoPoint.x;
            groundTile.x = isoPoint.x;
            groundTile.y = isoPoint.y;
        });

        // Update objects
        this.renderObjectsLayer.getChildren().forEach((object) => {
            const isoImage = object as IsoImage;

            // do not apply coordinates to the player
            if (isoImage.name === 'player') {
                return;
            }

            const point = this.cartesianHelper.getCartesianTilePosition(this.cartesianPoints[isoImage.getCartesianPointIndex()], this.TILE_SIZE);

            const isoPoint = this.cartesianToIsometric(point);
            isoImage.x = isoPoint.x;
            isoImage.y = isoPoint.y - this.ISO_TILE_HEIGHT * 0.5;
        });
    }

    private updateAnimations() {
        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            this.renderPlayerVehicle.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 1000));
            this.renderPlayerVehicle.scaleY = 1 + (0.12 * Math.sin(this.time.now / 1000));
        } else {
            this.renderPlayerVehicle.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 100));
            this.renderPlayerVehicle.scaleY = 1 + (0.08 * Math.sin(this.time.now / 100));
        }
    }
}
