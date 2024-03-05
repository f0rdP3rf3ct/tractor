import Point = Phaser.Geom.Point;

export class CartesianHelper {

    /**
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
     * @param point
     * @param tileSize
     */
    public getCartesianTilePosition(point: Point, tileSize: number) {
        return new Point(point.x * tileSize, point.y * tileSize);
    }

    /**
     * Get average (center) of provided points
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
}
