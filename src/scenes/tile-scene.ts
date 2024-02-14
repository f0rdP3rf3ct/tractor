import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

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

    private isoTiles: Phaser.GameObjects.Image[] = [];

    private graphics: Phaser.GameObjects.Graphics;

    private player: Phaser.GameObjects.Image;

    constructor() {
        super({key: 'TileScene'});
    }

    preload(): void {
        this.load.image('ground', '../assets/ground.png');
        this.load.image('grass', '../assets/grass.png');
        this.load.image('tractor', '../assets/tractor.png');
    }

    create(): void {
        this.graphics = this.add.graphics({lineStyle: {width: 2, color: 0xffffff}, fillStyle: {color: 0xff0000}});
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createCartesianTilePoints();
        this.updateCartesianTilePoints();

        // this.addCartesianPlayer();

        this.addIsoTiles();
    }

    private createCartesianTilePoints() {

        const halfTilemapSize = Math.floor(this.TILEMAP_SIZE / 2);

        for (let x = this.playerPosition.x - this.TILE_SIZE * halfTilemapSize; x <= this.playerPosition.x + this.TILE_SIZE * halfTilemapSize; x += this.TILE_SIZE) {
            for (let y = this.playerPosition.y - this.TILE_SIZE * halfTilemapSize; y <= this.playerPosition.y + this.TILE_SIZE * halfTilemapSize; y += this.TILE_SIZE) {
                this.cartesianPoints.push(new Phaser.Geom.Point(x, y));
            }
        }
    }

    private updateCartesianTilePoints() {

        this.cartesianPoints.forEach((point) => {
            point.x += this.moveDir.x * this.MOVE_SPEED;
            point.y += this.moveDir.y * this.MOVE_SPEED;

            const resetPointMinXOrtho = this.playerPosition.x - (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5)));
            const resetPointMaxXOrtho = this.playerPosition.x + (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5)));

            const resetPointMinYOrtho = this.playerPosition.y - (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5)));
            const resetPointMaxYOrtho = this.playerPosition.y + (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5)));


            if (point.x < resetPointMinXOrtho) {
                const offset = resetPointMinXOrtho - point.x;
                const newPointX = this.playerPosition.x + (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5) + 1));
                point.x = newPointX - offset;
            }

            if (point.x > resetPointMaxXOrtho) {
                const offset = resetPointMaxXOrtho - point.x;
                const newPointX = this.playerPosition.x - (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5) + 1));
                point.x = newPointX - offset;
            }

            if (point.y < resetPointMinYOrtho) {
                const offset = resetPointMinYOrtho - point.y;
                const newPointY = this.playerPosition.y + (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5) + 1));
                point.y = newPointY - offset;
            }

            if (point.y > resetPointMaxYOrtho) {
                const offset = resetPointMaxYOrtho - point.y;
                const newPointY = this.playerPosition.y - (this.TILE_SIZE * (Math.floor(this.TILEMAP_SIZE * .5) + 1));
                point.y = newPointY - offset;
            }

        });
    }

    private addCartesianPlayer() {
        this.add.rectangle(this.playerPosition.x, this.playerPosition.y, 64, 64, 0x00ff00);
    }

    private addIsoTiles() {
        this.cartesianPoints.forEach((point) => {
            const texture = Phaser.Math.RND.pick(['ground', 'grass']);
            const isoPoint = this.cartesianToIsometric(point);
            const image = this.add.image(200 + (isoPoint.x - 32), 150 + (isoPoint.y - 18), texture);

            this.isoTiles.push(image);
        });

        // Player
        this.player = this.add.image(this.playerPosition.x - 32, this.playerPosition.y - 32, 'tractor');
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

    private renderIsometric() {
        // this.graphics.clear();

        this.cartesianPoints.forEach((point, i) => {
            const isoPoint = this.cartesianToIsometric(point);
            this.isoTiles[i].x = 350 + (isoPoint.x - 32);
            this.isoTiles[i].y = 150 + (isoPoint.y - 18);
        });
    }
}
