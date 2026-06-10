# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Non-Stop Crops" — a browser-based isometric farming game (PWA). The player drives a tractor or harvester across a scrolling isometric tile grid, collecting all crops to win. Renders at 800×600 in Phaser 3.

**Stack:** Phaser 3.60, TypeScript 4.8, Webpack 5, webpack-dev-server on `localhost:5555`.

## Commands

```bash
npm run dev          # compile + start dev server at http://localhost:5555
npm run build        # production build → dist/ + dist/game.zip
npx tsc --noEmit     # type-check only, no emit
```

No test suite — validate by running the game in a browser and exercising the full flow: Boot → Loading → Menu → Countdown → Play → Win → Menu.

## Architecture

### Dual-Representation (mandatory for all interactive objects)

Every interactive object has two representations:
- **Logic object**: invisible `Phaser.Physics.Arcade.Image` at Cartesian coords (`alpha = 0`), drives physics/collision
- **Render object**: `IsoImage` or `Vehicle` Sprite at projected isometric screen position, no physics body

Conversion via `CartesianHelper.getCartesianToIsoCoordinate()`.

### Infinite Scroll

`PlayScene` holds `cartesianPoints: Point[]`. Each frame `updateCartesianTilePoints()` offsets points by `moveDir * MOVE_SPEED` and wraps out-of-bounds values back to the opposite edge. **`moveDir` is inverted from intuition**: moving "right" sets `moveDir.x = -1` (the grid scrolls opposite to apparent movement).

### State Machine

`PlayScene` implements `StateMachineInterface`. Flow:
```
MenuState → (BUTTON_A) → CountDownState → PlayState
PlayState → (all crops collected) → GameOverState → MenuScene
PlayState → (BUTTON_START) → MenuState
```
Each state implements `State { enter, updateState, exit }`. **Always remove `Controls.inputActionEvent` listeners in `exit()`** — they accumulate across state transitions.

### Render Layering

- `groundLayer` — static tile images
- `renderObjectsLayer` — crops + vehicles, depth-sorted by Y each frame in `updateDepthSortIsometrics()`

### Asset Loading

- `BootScene` loads only the UI atlas (for the loading screen itself)
- `LoadingScene.loadAssets()` loads all gameplay atlases and audio
- Atlas keys are `static` constants on the class that owns them — never use inline string literals

## Critical Rules

1. **Never edit `.js` siblings** of `.ts` files (`game.js`, `config.js`, etc.) — they are stale compiled artifacts.
2. **Never edit `dist/`** — build output only.
3. **`collisionGroup` objects must set `cartesianIndex`** via `logicObject.data.set('cartesianIndex', index)` to link to `cartesianPoints[]`.
4. **`IsoImage.name === 'player'`** skips the player during grid scroll updates — don't set this name on any non-player render object.
5. **New vehicles**: extend `Vehicle`, implement four `ANIM_KEY_*` constants + `createAnimations()` + `collisionBodySize` getter, then add to `buildVehicleRoster()` — that is the only method that needs editing.
6. **New scenes**: add to `GameConfig.scene` array in `config.ts` in correct boot order.
7. **Production build uses `webpack.production.config.js`**, not `webpack.config.js`.

## Coding Standards

- Classes: `PascalCase`; files: `kebab-case` for scenes, `PascalCase` for objects/states/misc
- Constants: `SCREAMING_SNAKE_CASE` for static class members
- Interfaces: `I`-prefixed (`IImageConstructor`)
- `noImplicitAny: true` — all parameters must be typed
- Import Phaser types at the top with `import X = Phaser.Y.Z` pattern (see `play-scene.ts`)
- One class per file; section dividers use `/* --- SECTION NAME --- */` in long files
- Remove any `console.log` encountered when touching a file — they exist in production paths (`Tractor.ts`, `CountDownState.ts`)