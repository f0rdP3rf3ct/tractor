# Plan: O(1) Crop Render Lookup via Map

## Context

`onPlayerCollision` in `play-scene.ts` previously found the matching `IsoImage` render object by iterating all `renderObjectsLayer` children and comparing `getCartesianPointIndex()` against the colliding physics body's `cartesianIndex`. At 1,600+ tiles this O(n) scan ran on every collision. Replacing it with a `Map<number, IsoImage>` keyed by `cartesianIndex` gives O(1) lookup with minimal code change.

---

## Changes

### 1. New field — `src/scenes/play-scene.ts`

```ts
private cropRenderMap: Map<number, IsoImage> = new Map();
```

### 2. Populated in `createObjectTiles()` after `renderObjectsLayer.add(renderObject)`

```ts
this.cropRenderMap.set(index, renderObject);
```

### 3. `onPlayerCollision` replaced linear `.filter()` with map lookup

```ts
const renderObject = this.cropRenderMap.get(index);

if (renderObject) {
    this.cropRenderMap.delete(index);
    renderObject.destroy();
    this.audioHarvesting.play();
    this.particleEmitterCrops.emitParticleAt(renderObject.x, renderObject.y, 10);
    this.cropsCollected++;
    this.checkWinCondition();
}
```

`cropRenderMap.delete(index)` before `destroy()` prevents stale entries as crops are harvested.

---

## Files Modified

- `src/scenes/play-scene.ts` — field added, map populated, lookup replaced
- `CLAUDE.md` — AI Plans section added
- `.claude/settings.json` — `planDirectory` set to `documentation/ai/plans`
