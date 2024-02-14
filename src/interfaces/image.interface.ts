export interface IImageConstructor {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string | Phaser.Textures.Texture;
  frame?: string | number;
  id?: string;
}

export interface IIsoImageConstructor {
  scene: Phaser.Scene;
  x: number; // cartesian
  y: number; // cartesian
  // width: number; // size in px
  // length: number; // size in px
  // height: number; // size in px
  texture: string | Phaser.Textures.Texture;
  frame?: string | number;
  id?: string;
}
