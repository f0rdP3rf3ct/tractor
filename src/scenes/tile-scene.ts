import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import {IsoImage} from "../objects/isoImage";

export class TileScene extends Phaser.Scene {

    private TILEMAP_SIZE = 10;
    private TILE_SIZE = 64;
    private PLAYER_START_POSITION = {x: 400, y: 300};

    // px / ms
    private MOVE_SPEED = 5;

    private playerPosition = {...this.PLAYER_START_POSITION}

    private cursors: CursorKeys;

    private moveDir = {x: 0, y: 0};

    private cartesianPoints: Phaser.Geom.Point[] = [];

    private graphics: Phaser.GameObjects.Graphics;

    private player: Phaser.GameObjects.Image;

    private groundLayer: Phaser.GameObjects.Layer;

    private objectsLayer: Phaser.GameObjects.Layer;

    constructor() {
        super({key: 'TileScene'});
    }

    preload(): void {
        this.load.image('ground', '../assets/ground.png');
        this.load.image('grass', '../assets/grass.png');
        this.load.image('tractor', '../assets/tractor.png');
        this.load.image('corn', '../assets/corn.png');
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.createCartesianTilePoints();
        this.updateCartesianTilePoints();

        // this.addCartesianPlayer();
        this.createLayers();
        this.addGroundTiles();
        this.addObjectTiles();
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
        this.objectsLayer = this.add.layer();
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
                const offset = resetPointMinXCart - point.x;
                const newPointX = this.TILEMAP_SIZE * this.TILE_SIZE
                point.x = newPointX - offset;
            }

            if (point.x > resetPointMaxXCart) {
                const offset = resetPointMaxXCart - point.x;
                const newPointX = 0;
                point.x = newPointX - offset;
            }

            if (point.y < resetPointMinYCart) {
                const offset = resetPointMinYCart - point.y;
                const newPointY = this.TILEMAP_SIZE * this.TILE_SIZE;
                point.y = newPointY - offset;
            }

            if (point.y > resetPointMaxYCart) {
                const offset = resetPointMaxYCart - point.y;
                const newPointY = 0;
                point.y = newPointY - offset;
            }

        });
    }

    private addCartesianPlayer() {
        this.add.rectangle(this.playerPosition.x, this.playerPosition.y, 64, 64, 0x00ff00);
    }

    private addGroundTiles() {
        this.cartesianPoints.forEach((point) => {
            const texture = Phaser.Math.RND.pick(['ground', 'grass']);
            const isoPoint = this.cartesianToIsometric(point);
            this.groundLayer.add(this.make.image({x: (isoPoint.x - 32), y: (isoPoint.y - 18), key: texture}))
        });

        this.player = new IsoImage({scene: this, x: this.playerPosition.x - 50, y: this.playerPosition.y - 50, texture: 'tractor'}, -1);

        // Player
        this.objectsLayer.add(this.player);
    }

    /**
     * Returns a random set of cartesian points
     * @private
     */
    private getRandomCartesianPoints(): number[] {
        const seed = (this.TILEMAP_SIZE * this.TILEMAP_SIZE).toString();
        Phaser.Math.RND.sow([seed]);

        const numberOfRandomIndices = 50;
        const originalArray = this.cartesianPoints;
        const randomIndicesArray = [];

        for (let i = 0; i < numberOfRandomIndices; i++) {
            const randomIndex = Phaser.Math.RND.integerInRange(0, originalArray.length - 1);
            randomIndicesArray.push(randomIndex);
        }

        return randomIndicesArray;
    }

    private addObjectTiles() {

        const objectPositionIndices = this.getRandomCartesianPoints();
        objectPositionIndices.forEach((index) => {
            const isoPoint = this.cartesianToIsometric(this.cartesianPoints[index]);
            const object = new IsoImage({scene: this, x: (isoPoint.x - 32), y: (isoPoint.y - 32), texture: 'corn'}, index);
            this.objectsLayer.add(object);
        });
    }

    private updateInput() {

        if (this.cursors) {
            this.moveDir.x = 0;
            this.moveDir.y = 0;

            if (this.cursors.up.isDown) {
                this.moveDir.y = -1;
                this.player.scaleX = -1;
            }

            if (this.cursors.down.isDown) {
                this.moveDir.y = 1;
                this.player.scaleX = -1;
            }

            if (this.cursors.left.isDown) {
                this.moveDir.x = 1;
                this.player.scaleX = 1;
            }

            if (this.cursors.right.isDown) {
                this.moveDir.x = -1;
                this.player.scaleX = 1;
            }
        }
    }

    update() {
        this.updateInput();
        this.updateCartesianTilePoints();
        // this.debugPoints();
        this.depthSortIsometrics();
        this.renderIsometric();
    }

    private debugPoints() {
        this.graphics.clear();
        this.cartesianPoints.forEach((point) => {
            this.graphics.fillPointShape(point, 4);

            const dist = Phaser.Math.Distance.BetweenPoints(this.playerPosition, point);

            // Define your minimum and maximum distances for alpha interpolation
            let minDistance = 100; // Adjust this based on your needs
            let maxDistance = 300; // Adjust this based on your needs

            // Interpolate the alpha value based on the distance
            let normalizedDistance = Phaser.Math.Clamp((dist - minDistance) / (maxDistance - minDistance), 0, 1);
            let interpolatedAlpha = 1 - normalizedDistance;

            this.graphics.fillStyle(0xff0000, interpolatedAlpha);

            this.graphics.fillRect(point.x - this.TILE_SIZE * .5, point.y - this.TILE_SIZE * .5, this.TILE_SIZE, this.TILE_SIZE);
        });
    }

    private cartesianToIsometric(cartPt: Phaser.Geom.Point) {
        const tempPt = new Phaser.Geom.Point(0, 0);
        tempPt.x = (cartPt.x - cartPt.y) / 2;
        tempPt.y = (cartPt.x + cartPt.y) / 4;
        return tempPt;
    }


    private depthSortIsometrics() {
        this.objectsLayer.sort('y', function(a : any, b : any) {
            if (a.y < b.y) {
                return -1;
            }
            if (a.y > b.y) {
                return 1;
            }
            return 0;
        });

    };

    private renderIsometric() {
        // this.graphics.clear();
        this.cartesianPoints.forEach((point, i) => {
            // ground
            const isoPoint = this.cartesianToIsometric(point);
            const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;
            groundTile.x = (5 * 64) + isoPoint.x;
            groundTile.y = isoPoint.y;
        });

        // Update objects
        this.objectsLayer.getChildren().forEach((object) => {
            const isoImage = object as IsoImage;

            // do not apply coordinates to the player
            if(isoImage.texture.key === 'tractor') {
                return;
            }

            const isoPoint = this.cartesianToIsometric(this.cartesianPoints[isoImage.getCartesianPointIndex()]);
            isoImage.x = (5 * 64) + (isoPoint.x);
            isoImage.y = (isoPoint.y - 18);
        });



    }
}
