
// source: https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
// https://www.youtube.com/watch?v=04oQ2jOUjkU


// These are the four numbers that define the transform, i hat and j hat
import Point = Phaser.Geom.Point;

export class IsoHelper {

    static i_x = 1;
    static i_y = 0.5;

    static j_x = -1;
    static j_y = 0.5;

    // Sprite size
    static w = 64;
    static h = 64;

    private static invert_matrix(a: number, b: number, c: number, d: number) {
        // Determinant
        const det = (1 / (a * d - b * c));

        return {
            a: det * d,
            b: det * -b,
            c: det * -c,
            d: det * a,
        }
    }

    /**
     * Converts a grid coordinate to a screen coordinate
     * @param point
     */
    public static toIsoCoordinateNoSpriteSize(point: Point): Point {

        return new Point(
            (point.x * this.i_x) + (point.y * this.j_x),
            (point.x * this.i_y) + (point.y * this.j_y),
        )

    }

    /**
     * Converts a grid coordinate to a screen coordinate
     * @param point
     */
    public static toIsoCoordinateWithSpriteSize(point: Point): Point {
        return new Point(
            (point.x * this.i_x * 0.5 * this.w) + (point.y * this.j_x * 0.5 * this.w),
            (point.x * this.i_y * 0.5 * this.h) + (point.y * this.j_y * 0.5 * this.h),
        )
    }

    public static toCartesianCoordinate(screen: Point): Point {
        const a = this.i_x * 0.5 * this.w;
        const b = this.j_x * 0.5 * this.w;
        const c = this.i_y * 0.5 * this.h;
        const d = this.j_y * 0.5 * this.h;

        const inv = this.invert_matrix(a, b, c, d);

        return new Point(
            screen.x * inv.a + screen.y * inv.b,
            screen.x * inv.c + screen.y * inv.d,
        )
    }
}
