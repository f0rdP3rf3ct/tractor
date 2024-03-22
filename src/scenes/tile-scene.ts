import Image = Phaser.GameObjects.Image;
import Point = Phaser.Geom.Point;
import Layer = Phaser.GameObjects.Layer;
import Group = Phaser.Physics.Arcade.Group;
import HTML5AudioSound = Phaser.Sound.HTML5AudioSound;
import NoAudioSound = Phaser.Sound.NoAudioSound;
import WebAudioSound = Phaser.Sound.WebAudioSound;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {IsoImage} from "../objects/isoImage";
import {Tractor} from "../objects/Tractor";
import {Vehicle} from "../objects/base/Vehicle";
import {Harvester} from "../objects/Harvester";
import {CartesianHelper} from "../misc/CartesianHelper";
import {State, StateMachineInterface} from "../interfaces/stateMachine.interface";
import {MenuState} from "../states/MenuState";


export class TileScene extends Phaser.Scene implements StateMachineInterface {

    /**
     * Game State
     */
    private currentGameState: State;

    /**
     * Constants
     */
    static GAME_ATLAS_KEY = 'gameAssets';

    private TILEMAP_SIZE = 40;

    private TILE_SIZE = 64;

    private ISO_TILE_WIDTH = 64;

    private ISO_TILE_HEIGHT = 32;

    private INNER_MOST_BLANKS_TILE_SIZE = 9;

    private MOVE_SPEED = 0.2;

    /**
     * Variables
     */
    private availableVehicles: Vehicle[] = [];

    private selectedPlayerModelIndex = 1;

    private isoGridHeight: number;

    private isoGridWidth: number;

    private lastDirection: string = 'right';

    private playerFacingDir = 1;

    private moveDir: Point = new Point(0, 0);

    private isoGridGlobalCenter: Point;

    private cartesianPoints: Point[] = [];

    private logicPlayer: Image;

    private renderPlayerVehicle: Vehicle;

    private groundLayer: Layer;

    private renderObjectsLayer: Layer;

    private collisionGroup: Group;


    // Audio
    private audioEngine: HTML5AudioSound | WebAudioSound | NoAudioSound;

    private audioHarvesting: HTML5AudioSound | WebAudioSound | NoAudioSound;

    private audioHonk: HTML5AudioSound | WebAudioSound | NoAudioSound;

    // Particles
    private particleEmitterCrops: ParticleEmitter;

    private cartesianHelper: CartesianHelper;

    constructor() {
        super({key: 'TileScene'});
    }

    changeState(newState: State): void {
        if (this.currentGameState) {
            this.currentGameState.exit();
        }

        this.currentGameState = newState;

        if (this.currentGameState) {
            this.currentGameState.enter(this);
        }
    }

    getCurrentState(): State {
        throw new Error("Method not implemented.");
    }

    updateStateMachine(): void {
        throw new Error("Method not implemented.");
    }

    preload(): void {
        // debug
        this.load.image('cartDebugObject', './assets/cartDebugObject.png');
        this.load.image('cartDebugPlayer', './assets/cartDebugPlayer.png');
    }

    create(): void {
        this.createMembers();
        this.createAudio();

        this.createCartesianTilePoints();
        this.updateCartesianTilePoints();

        this.createLayers();
        this.createGroundTiles();
        this.createObjectTiles();

        this.createPhysicsPlayer();
        this.createVehicles();

        this.createParticles();
        this.createPhysics();

        this.changeState(new MenuState(this))
    }

    update(time: number, delta: number) {
        if (this.currentGameState) {
            this.currentGameState.updateState(this, delta);
        }
    }

    /* ---------------------------------------------------------------
     * GAME CREATE METHODS
      ---------------------------------------------------------------*/

    private createMembers() {
        this.cartesianHelper = new CartesianHelper();
        this.collisionGroup = this.physics.add.group();
        this.isoGridWidth = this.TILEMAP_SIZE * this.ISO_TILE_WIDTH;
        this.isoGridHeight = this.TILEMAP_SIZE * this.ISO_TILE_HEIGHT;
        this.isoGridGlobalCenter = new Point((this.cameras.main.width * 0.5), (this.cameras.main.height * 0.5) - (this.isoGridHeight * 0.5));
    }

    private createAudio() {
        const backgroundTheme = this.sound.add('backgroundTheme', {loop: true});
        backgroundTheme.play();

        this.audioEngine = this.sound.add('tractorEngine', {loop: true});
        this.audioHarvesting = this.sound.add('harvesting', {loop: false});
        this.audioHonk = this.sound.add('honk', {loop: false});
    }

    private createCartesianTilePoints() {
        this.cartesianPoints = this.cartesianHelper.createCartesianPoints(this.TILEMAP_SIZE);
    }

    private createLayers() {
        this.groundLayer = this.add.layer();
        this.renderObjectsLayer = this.add.layer();
    }

    private createGroundTiles() {
        this.cartesianPoints.forEach((inPoint) => {
            const point = this.cartesianHelper.getCartesianTilePosition(inPoint, this.TILE_SIZE);
            const frame = Phaser.Math.RND.pick(['object/ground_2.png', 'object/ground_1.png']);
            const isoPoint = this.cartesianHelper.getCartesianToIsoCoordinate(point);
            this.groundLayer.add(this.make.image({
                x: this.isoGridGlobalCenter.x + (isoPoint.x - this.ISO_TILE_WIDTH * 0.5),
                y: this.isoGridGlobalCenter.y + (isoPoint.y - this.ISO_TILE_HEIGHT * 0.5),
                key: TileScene.GAME_ATLAS_KEY,
                frame: frame
            }))
        });
    }

    private createObjectTiles() {

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
            const isoPoint = this.cartesianHelper.getCartesianToIsoCoordinate(point);
            const renderObject = new IsoImage({
                scene: this,
                x: this.isoGridGlobalCenter.x + (isoPoint.x - 32),
                y: this.isoGridGlobalCenter.y + (isoPoint.y - 32),
                texture: TileScene.GAME_ATLAS_KEY,
                frame: 'object/cornfield.png'
            }, index);
            this.renderObjectsLayer.add(renderObject);
        });

    }

    private createPhysicsPlayer() {
        const centerPoint = this.cartesianHelper.getCenterOfPoints(this.cartesianPoints);
        const cartPlayerPosition = this.cartesianHelper.getCartesianTilePosition(centerPoint, this.TILE_SIZE);

        this.logicPlayer = this.physics.add.image(cartPlayerPosition.x, cartPlayerPosition.y, 'cartDebugPlayer');
        this.logicPlayer.alpha = 0.2;

        this.physics.add.existing(this.logicPlayer);
    }

    private createVehicles() {
        const centerPoint = this.cartesianHelper.getCenterOfPoints(this.cartesianPoints);
        const cartPlayerPosition = this.cartesianHelper.getCartesianTilePosition(centerPoint, this.TILE_SIZE);
        const renderPlayerPosition = this.cartesianHelper.getCartesianToIsoCoordinate(cartPlayerPosition);

        const x = this.isoGridGlobalCenter.x + renderPlayerPosition.x;
        const y = this.isoGridGlobalCenter.y + (renderPlayerPosition.y - this.ISO_TILE_HEIGHT * 0.5);

        this.availableVehicles = [new Tractor(this, x, y), new Harvester(this, x, y)];

        this.availableVehicles.forEach((vehicle) => {
            this.add.existing(vehicle);
            this.renderObjectsLayer.add(vehicle);
        });

        this.cyclePlayerVehicle(0);
    }

    private createParticles() {
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

    private createPhysics() {
        this.physics.add.overlap(this.logicPlayer, this.collisionGroup, this.onPlayerCollision, null, this);
    }

    /* ---------------------------------------------------------------
    * EVENTS
     ---------------------------------------------------------------*/

    private onPlayerCollision(player: any, object: any) {

        const index = object.data.get('cartesianIndex');

        if (object) {
            object.destroy();

            // determine with which child collision occurred...
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

    /* ---------------------------------------------------------------
    | UPDATE METHODS
     ---------------------------------------------------------------*/

    public updateCartesianTilePoints() {

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

    public updateLogic() {
        this.collisionGroup.getChildren().forEach((object) => {
            const cartTilePosition = this.cartesianHelper.getCartesianTilePosition(this.cartesianPoints[object.data.get('cartesianIndex')], this.TILE_SIZE);
            const body = object.body as Phaser.Physics.Arcade.Body;
            body.x = cartTilePosition.x;
            body.y = cartTilePosition.y;
        });
    }

    public updateAudio() {
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

    public updateDepthSortIsometrics() {
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

    public updateRenderIsometric(delta: number) {
        // this.graphics.clear();
        this.cartesianPoints.forEach((inPoint, i) => {
            const point = this.cartesianHelper.getCartesianTilePosition(inPoint, this.TILE_SIZE);
            // ground
            const isoPoint = this.cartesianHelper.getCartesianToIsoCoordinate(point);
            const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;

            groundTile.x = this.isoGridGlobalCenter.x + isoPoint.x;
            groundTile.y = this.isoGridGlobalCenter.y + isoPoint.y;
        });

        // Update objects
        this.renderObjectsLayer.getChildren().forEach((object) => {
            const isoImage = object as IsoImage;

            // do not apply coordinates to the player
            if (isoImage.name === 'player') {
                return;
            }

            const point = this.cartesianHelper.getCartesianTilePosition(this.cartesianPoints[isoImage.getCartesianPointIndex()], this.TILE_SIZE);

            const isoPoint = this.cartesianHelper.getCartesianToIsoCoordinate(point);
            isoImage.x = this.isoGridGlobalCenter.x + isoPoint.x;
            isoImage.y = this.isoGridGlobalCenter.y + (isoPoint.y - this.ISO_TILE_HEIGHT * 0.5);
        });
    }

    /**
     * Updates the scale and animation of the rendered player depending on move direction / input
     */
    public updateRenderPlayerVehicle() {
        // Moving UP
        if (this.moveDir.y === -1 && this.playerFacingDir === -1) {
            this.renderPlayerVehicle.scaleX = -1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_FRONT, true);
        }

        // Moving DOWN
        if (this.moveDir.y === 1 && this.playerFacingDir === -1) {
            this.renderPlayerVehicle.scaleX = -1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_BACK, true);
        }

        // Moving LEFT
        if (this.moveDir.x === 1 && this.playerFacingDir === 1) {
            this.renderPlayerVehicle.scaleX = 1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_BACK, true);
        }

        // Moving RIGHT
        if (this.moveDir.x === -1 && this.playerFacingDir === 1) {
            this.renderPlayerVehicle.scaleX = 1;
            this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_MOVE_FRONT, true);
        }

        // Not moving AT ALL
        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            if (this.lastDirection === 'down' || this.lastDirection == 'left') {
                this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_IDLE_BACK, true);
            }

            if (this.lastDirection === 'up' || this.lastDirection === 'right') {
                this.renderPlayerVehicle.play(this.renderPlayerVehicle.ANIM_KEY_IDLE_FRONT, true);
            }
        }

    }

    public updateAnimations() {
        if (this.moveDir.x === 0 && this.moveDir.y === 0) {
            this.renderPlayerVehicle.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 1000));
            this.renderPlayerVehicle.scaleY = 1 + (0.12 * Math.sin(this.time.now / 1000));
        } else {
            this.renderPlayerVehicle.scaleX = this.playerFacingDir + (0.05 * Math.sin(this.time.now / 100));
            this.renderPlayerVehicle.scaleY = 1 + (0.08 * Math.sin(this.time.now / 100));
        }
    }


    /* ---------------------------------------------------------------
    * MISC.
     ---------------------------------------------------------------*/

    public playAudioHonk(): void {
        if (!this.audioHonk.isPlaying) {
            this.audioHonk.play();
        }
    }

    /**
     * @private
     * @param dir
     */
    public cyclePlayerVehicle(dir: number) {
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

    /* ---------------------------------------------------------------
    * GETTER & SETTER
     ---------------------------------------------------------------*/


    public getLastDirection(): string {
        return this.lastDirection;
    }

    public setLastDirection(lastDirection: string) {
        this.lastDirection = lastDirection;
    }

    public getMoveDir(): Point {
        return this.moveDir;
    }

    public setMoveDir(moveDir: Point) {
        this.moveDir = moveDir;
    }

    public setPlayerFacingDirection(direction: number) {
        this.playerFacingDir = direction;
    }

    public getPlayerFacingDirection(): number {
        return this.playerFacingDir;
    }
}
