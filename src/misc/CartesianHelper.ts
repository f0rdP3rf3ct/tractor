import Point = Phaser.Geom.Point;

export class CartesianHelper {

    /**
     * Returns an array of Points representing the tilemap
     *
     * @param tilemapSize
     */
    public createCartesianPoints(tilemapSize: number): Point[] {
        const points = [];
        for (let x = 0; x <= tilemapSize; x++) {
            for (let y = 0; y <= tilemapSize; y++) {
                points.push(new Point(x, y));
            }
        }
        return points;
    }

    /**
     * Returns an array of Points that build the tile-coordinates in the center of the map.
     *
     * @param tilemapSize
     * @param blankTileSize
     */
    public getInnerMostCartesianPoints(tilemapSize: number, blankTileSize: number): Point[] {
        const numRows = tilemapSize;
        const numCols = tilemapSize;

        let startX = Math.floor((numRows - blankTileSize) / 2);
        let startY = Math.floor((numCols - blankTileSize) / 2);

        let endX = startX + blankTileSize - 1;
        let endY = startY + blankTileSize - 1;

        // Ensure the calculated indices are within bounds
        startX = Math.max(startX, 0);
        startY = Math.max(startY, 0);
        endX = Math.min(endX, numCols - 1);
        endY = Math.min(endY, numRows - 1);

        let innerMostPoints: Point[] = [];

        for (let i = startY; i <= endY; i++) {
            for (let j = startX; j <= endX; j++) {
                innerMostPoints.push(new Point(j, i));
            }
        }

        return innerMostPoints;
    }

    /**
     * Return a Point containing the position with respect of the defined tileSize
     *
     * @param point
     * @param tileSize
     */
    public getCartesianTilePosition(point: Point, tileSize: number): Point {
        return new Point(point.x * tileSize, point.y * tileSize);
    }

    /**
     * Get average (center-coordinates) of an array of provided points
     * @param points
     */
    public getCenterOfPoints(points: Point[]): Point {
        let totalX = 0;
        let totalY = 0;

        for (var i = 0; i < points.length; i++) {
            totalX += points[i].x;
            totalY += points[i].y;
        }

        const averageX = Math.floor(totalX / points.length);
        const averageY = Math.floor(totalY / points.length);

        return new Point(averageX, averageY);
    }

    /**
     * Returns the cartesian coordinates of the provided isometric point
     * @param point
     */
    public getCartesianToIsoCoordinate(point: Point): Point {
        const tempPt = new Point();
        // Standard 2:1 iso projection. Input is in pixel space (scaled by TILE_SIZE=64).
        // Divisor 2 = TILE_SIZE / ISO_TILE_WIDTH  (64/64=1, then ÷2 for screen x → ÷2)
        tempPt.x = Math.floor((point.x - point.y) / 2);
        // Divisor 4 = TILE_SIZE / ISO_TILE_HEIGHT (64/32=2, then ÷2 for screen y → ÷4)
        tempPt.y = Math.floor((point.x + point.y) / 4);
        return tempPt;
    }

    /** Zero-allocation variant — writes into `out` instead of allocating a new Point. */
    public getCartesianTilePositionInto(point: Point, tileSize: number, out: Point): void {
        out.x = point.x * tileSize;
        out.y = point.y * tileSize;
    }

    /** Zero-allocation variant — writes into `out` instead of allocating a new Point. */
    public getCartesianToIsoCoordinateInto(point: Point, out: Point): void {
        // Same projection as getCartesianToIsoCoordinate; see that method for divisor explanation.
        out.x = Math.floor((point.x - point.y) / 2);
        out.y = Math.floor((point.x + point.y) / 4);
    }
}
