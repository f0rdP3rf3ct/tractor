import {IsoTile} from "../objects/IsoTile";
import {IsoImage} from "../objects/isoImage";
import Point = Phaser.Geom.Point;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export class MainScene extends Phaser.Scene {

    private groundLayer: Phaser.Tilemaps.TilemapLayer;

    private isoMapStartingPoint: Point = new Point(300, 200);

    private isoSortingObjects: IsoImage[] = [];

    private sortDepth = 0;

    private moveDirX = -1;

    private moveDirY = 0;

    private mapIsoLength = 6;

    private fieldChunk = [
        [0,1, 1, 1],
        [0,1, 1, 1],
        [0,1, 1, 1,]
    ];

    private cursors: CursorKeys;


    constructor() {
        super({key: 'MainScene'});
    }

    preload(): void {
        this.loadImages();
    }

    create(): void {

        this.buildObjects();
        this.buildTrigger();

        this.updateBounds();
        this.updateTopologicalGraph();
        this.doTopologicalSort();

        this.cursors = this.input.keyboard.createCursorKeys();

        // this.debugIsoSortingObjects();
    }

    doTopologicalSort() {
        this.sortDepth = 0;
        for (let i = 0; i < this.isoSortingObjects.length; i++) {
            this.visitNode(this.isoSortingObjects[i]);
        }
    }

    visitNode(node: IsoImage): void {
        if (node.isoVisitedFlag === 0) {
            node.isoVisitedFlag = 1;

            const spritesBehindLength: number = node.isoSpritesBehind.length;

            for (let i = 0; i < spritesBehindLength; ++i) {
                if (node.isoSpritesBehind[i] === null) {
                    break;
                } else {
                    this.visitNode(node.isoSpritesBehind[i]);
                    node.isoSpritesBehind[i] = null;
                }
            }

            node.depth = this.sortDepth++;
        }
    }

    updateBounds(): void {
        this.isoSortingObjects.forEach((object) => {
            object.minX = object.x + object.minXRelative;
            object.maxX = object.x + object.maxXRelative;

            object.minY = object.y + object.minYRelative;
            object.maxY = object.y + object.maxYRelative;

            object.minZ = object.z + object.minZRelative;
            object.maxZ = object.z + object.maxZRelative;
        });
    }

    updateTopologicalGraph(): void {
        let a: IsoImage;
        let b: IsoImage;

        const isoSpritesLength: number = this.isoSortingObjects.length;

        for (let i = 0; i < isoSpritesLength; i++) {
            a = this.isoSortingObjects[i];
            let behindIndex = 0;

            for (let j = 0; j < isoSpritesLength; j++) {
                if (i !== j) {
                    b = this.isoSortingObjects[j];
                    // console.log(`comparing a: ${a.id}, b: ${b.id} : (b.minX) ${b.minX} < (a.maxX) ${a.maxX} && (b.minY) ${b.minY} < (a.maxY) ${a.maxY} && (b.minZ) ${b.minZ} < (a.maxZ) ${a.maxZ}`);
                    if (a.maxX > b.maxX && a.maxY > b.maxY) {
                        a.isoSpritesBehind[behindIndex++] = b;
                    }
                }
            }

            a.isoVisitedFlag = 0;
        }
    }

    update(): void {

        if (this.cursors) {
            this.moveDirY = 0;
            this.moveDirX = 0;

            if (this.cursors.up.isDown) {
                this.moveDirY = -1;
            }

            if (this.cursors.down.isDown) {
                this.moveDirY = 1;
            }

            if (this.cursors.left.isDown) {
                this.moveDirX = 1;
            }

            if (this.cursors.right.isDown) {
                this.moveDirX = -1;
            }
        }


        /*
        this.isoSortingObjects.forEach((obj) => {
            this.checkNextTile(obj);
        });
         */
    }

    /**
     *
     * @param obj
     * @private
     */
    private checkNextTile(obj: IsoImage) {

        if (obj.targetCartX === obj.x) {
            // Destination reached
            obj.isoX = obj.isoTargetX;
            obj.isoTargetX = undefined;
            obj.targetCartX = undefined;
        }

        if (obj.cartTargetY === obj.y) {
            obj.isoY = obj.isoTargetY;
            obj.isoTargetY = undefined;
            obj.cartTargetY = undefined;
        }

        const currentIsoX = obj.isoX;
        const currentIsoY = obj.isoY;

        // by default stay
        let nextIsoTileX = currentIsoX;
        let nextIsoTileY = currentIsoY;

        if (this.moveDirX === -1) {
            nextIsoTileX = currentIsoX - 1;
        }

        if (this.moveDirY === -1) {
            nextIsoTileY = currentIsoY - 1;
        }

        if (this.moveDirX === 1) {
            nextIsoTileX = currentIsoX + 1;
        }

        if (this.moveDirY === 1) {
            nextIsoTileY = currentIsoY + 1;
        }

        if (nextIsoTileX < 0) {
            // Moving out of bounds
        }

        if (nextIsoTileX > this.mapIsoLength) {
        }

        if (this.fieldChunk[nextIsoTileY][nextIsoTileX]) {

            const tileWidth = 64;
            const tileHeight = 32;

            obj.isoTargetX = nextIsoTileX;
            obj.isoTargetY = nextIsoTileY;

            obj.targetCartX = this.isoMapStartingPoint.x + ((nextIsoTileX - nextIsoTileY) * (tileWidth * .5));
            obj.cartTargetY = this.isoMapStartingPoint.y + ((nextIsoTileX + nextIsoTileY) * (tileHeight * .5));
        }
    }

    private loadImages(): void {
        this.load.image('tiles', '../assets/tiles.png');
        this.load.image('plant', '../assets/corn.png');
        this.load.image('ground', '../assets/ground.png');
        this.load.image('tractor', '../assets/tractor.png');
    }

    /**
     * Draws the base layer of the map
     * @param data
     * @private
     */
    private drawBaseLayer(data: number[][]): void {
        for (let y = data.length - 1; y >= 0; y--) {
            for (let x = 0; x < data[y].length; x++) {
                const groundTile = this.groundLayer.putTileAt(data[y][x], x, y) as IsoTile;
            }
        }
    }

    private debugIsoSortingObjects(): void {
        this.isoSortingObjects.forEach((item) => {
            const rect = this.add.rectangle(item.x, item.y, 64, 32);
            rect.setOrigin(0.5, 0.5);
            rect.setStrokeStyle(1, 0xFF0000);
            rect.depth = item.depth;

            const text = this.add.text(item.minX, item.minY, item.id + " " + item.depth);
            text.depth = 100;
        });
    }

    private buildMap(): void {

        const groundData = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 1, 2, 1, 1],
            [1, 2, 2, 1, 2, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ];

        const groundMap = this.make.tilemap({data: groundData, tileWidth: 64, tileHeight: 32});

        // TODO: TS Error of Phaser
        /* @ts-ignore */
        groundMap.orientation = Phaser.Tilemaps.Orientation.ISOMETRIC;

        const groundTileSet = groundMap.addTilesetImage('groundTileSet', 'tiles');

        this.groundLayer = groundMap.createBlankLayer('groundLayer', groundTileSet, this.isoMapStartingPoint.x, this.isoMapStartingPoint.y);

        this.drawBaseLayer(groundData);
    }

    private buildObjects(): void {

        const objectsData = this.fieldChunk;

        let id = 0;

        const tileWidth = 64;
        const tileHeight = 32;

        for (let y = 0; y < objectsData.length; y++) {
            for (let x = 0; x < objectsData[y].length; x++) {

                if (objectsData[y][x] === 1) {
                    id++;
                    const plant = new IsoImage({
                        scene: this,
                        x: this.isoMapStartingPoint.x + ((x - y) * (tileWidth * .5)),
                        y: this.isoMapStartingPoint.y + ((x + y) * (tileHeight * .5)),
                        texture: 'plant',
                        id: 'p' + id
                    });

                    plant.isoX = x;
                    plant.isoY = y;
                    plant.isoZ = 0;

                    this.isoSortingObjects.push(plant);
                }

                if (objectsData[y][x] === 0) {
                    id++;
                    const plant = new IsoImage({
                        scene: this,
                        x: this.isoMapStartingPoint.x + ((x - y) * (tileWidth * .5)),
                        y: this.isoMapStartingPoint.y + ((x + y) * (tileHeight * .5)),
                        texture: 'ground',
                        id: 'g' + id
                    });

                    plant.isoX = x;
                    plant.isoY = y;
                    plant.isoZ = 0;

                    this.isoSortingObjects.push(plant);
                }
            }
        }

        this.isoSortingObjects.forEach((plant) => {
            this.add.existing(plant);
        });

        // tractor
        const tractor = new IsoImage({
            scene: this,
            x: this.isoMapStartingPoint.x + ((4 - 1) * (tileWidth * .5)),
            y: this.isoMapStartingPoint.y + ((4 + 1) * (tileHeight * .5)),
            texture: 'tractor',
            id: 't'
        });

        this.isoSortingObjects.push(tractor);
        this.add.existing(tractor);
    }

    private buildTrigger() {

    }
}
