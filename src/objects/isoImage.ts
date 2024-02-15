import {IImageConstructor, IIsoImageConstructor} from "../interfaces/image.interface";

export class IsoImage extends Phaser.GameObjects.Image {

    protected cartesianPointIndex : number;

    constructor(aParams: IImageConstructor, cartesianPointIndex: number) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
        this.cartesianPointIndex = cartesianPointIndex;
    }

    public getCartesianPointIndex(): number {
        return this.cartesianPointIndex;
    }

}
