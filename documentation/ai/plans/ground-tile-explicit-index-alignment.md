# Plan: Explicit Ground Tile Index Alignment

## Context

`updateRenderIsometric()` updated each ground tile's screen position by iterating `cartesianPoints` with an index `i` and accessing `groundLayer.getChildren()[i]`. The 1:1 correspondence between array position and layer child order was incidental — both were populated by iterating the same array in the same loop, but nothing documented or enforced this. Sorting the layer, adding tiles out of order, or filtering `cartesianPoints` would silently update the wrong tiles.

Crop tiles already solved the same problem with `cropRenderMap`. This change applies the same idea to ground tiles: a parallel `groundTiles: Phaser.GameObjects.Image[]` array makes the index alignment an explicit contract.

---

## Changes

### 1. New field — `src/scenes/play-scene.ts`

```ts
private groundTiles: Phaser.GameObjects.Image[] = [];
```

### 2. Populated in `createGroundTiles()`

```ts
const tile = this.make.image({ x, y, key, frame });
this.groundLayer.add(tile);
this.groundTiles.push(tile);
```

### 3. Access changed in `updateRenderIsometric()`

```ts
// Before:
const groundTile = this.groundLayer.getChildren()[i] as Phaser.GameObjects.Image;

// After:
const groundTile = this.groundTiles[i];
```

---

## Files Modified

- `src/scenes/play-scene.ts` — field added, array populated, index access updated
- `documentation/architecture/isometricRendering/isometricRendering.md` — class diagram and Considerations updated
