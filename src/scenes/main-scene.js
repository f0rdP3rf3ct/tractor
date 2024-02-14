"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScene = void 0;
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }
    preload() {
        this.loadMap();
        // this.load.image('redhat', '../assets/redhat.png');
        // this.load.image('redParticle', '../assets/red.png');
    }
    loadMap() {
        // this.load.tilemapTiledJSON('map', '../assets/map01.json');
        this.load.image('tiles', '../assets/grass_green_64x32.png');
    }
    buildMap() {
        const mapData = new Phaser.Tilemaps.MapData({
            width: 100,
            height: 100,
            tileWidth: 64,
            tileHeight: 32,
            orientation: 'isometric',
            format: Phaser.Tilemaps.Formats.ARRAY_2D,
        });
        const map = new Phaser.Tilemaps.Tilemap(this, mapData);
        const tileset = map.addTilesetImage('grass_green_64x32.png', 'tiles', 64, 32, 0, 0);
        const layer = map.createBlankLayer('layer1', tileset, 200, 200);
        const data = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ];
        let y = 0;
        data.forEach(row => {
            row.forEach((tile, x) => {
                layer.putTileAt(tile, x, y);
            });
            y++;
        });
    }
    create() {
        this.buildMap();
    }
}
exports.MainScene = MainScene;
