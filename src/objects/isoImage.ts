import {IImageConstructor, IIsoImageConstructor} from "../interfaces/image.interface";

export class IsoImage extends Phaser.GameObjects.Image {

    // current iso position
    public isoX: number;
    public isoY: number;
    public isoZ: number;

    // iso move target
    public isoTargetX: number;
    public isoTargetY: number;

    // cartesian move target
    public targetCartX: number;
    public cartTargetY: number;

    public minX: number;
    public maxX: number;

    public minY: number;
    public maxY: number;

    public minZ: number;
    public maxZ: number;

    public minXRelative: number;
    public maxXRelative: number;

    public minYRelative: number;
    public maxYRelative: number;

    public minZRelative: number = 0;
    public maxZRelative: number = 0;

    public isoSpritesBehind: IsoImage[] = [];
    public isoVisitedFlag: number = 0;

    public id: string = '';

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.minXRelative = -1 * this.width * .5;
        this.maxXRelative = this.width * .5;

        this.minYRelative = -1 * this.height * .5;
        this.maxYRelative = this.height * .5;

        this.id = aParams.id;
    }
}
