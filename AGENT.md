# AGENT.md — Non-Stop Crops

## Project Overview

"Non-Stop Crops" (short name: NSC) is a browser-based isometric farming game. The player drives a tractor or harvester across a scrolling isometric tile grid and collects all crops to win. It is a PWA (Progressive Web App) distributable as a ZIP archive.

The game renders at 800×600 in a Phaser 3 canvas. The world uses a dual-representation model: an invisible Cartesian physics layer drives movement and collision, while a separate isometric render layer handles visuals. The tile grid scrolls infinitely by wrapping Cartesian tile coordinates when they go out of bounds.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Game framework | Phaser 3.60.0 |
| Language | TypeScript 4.8 (`noImplicitAny: true`, target ES6) |
| Bundler | Webpack 5 (ts-loader) |
| Dev server | webpack-dev-server on `localhost:5555` |
| Input | Keyboard (cursor keys + Space/X/Y) and Gamepad |
| Audio | Phaser HTML5/Web Audio (MP3 + OGG fallback) |
| Assets | TexturePacker atlases (JSON Hash format) |
| Tile maps | Tiled (source only, not loaded at runtime) |
| PWA | `manifest.json` + `sw.js` service worker |

No test framework is present.

---

## Repository Structure

```
Tractor2/
├── src/
│   ├── game.ts               # Entry point — creates Phaser.Game on window load
│   ├── config.ts             # GameConfig: scene order, canvas size, physics setup
│   ├── index.html            # HTML template (used by production webpack)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── scenes/
│   │   ├── boot-scene.ts     # Loads UI atlas, starts LoadingScene
│   │   ├── loading-scene.ts  # Loads all game assets, starts MenuScene
│   │   ├── menu-scene.ts     # Main menu (New Game / Controls)
│   │   └── tile-scene.ts     # Core gameplay scene; owns the state machine
│   ├── objects/
│   │   ├── base/Vehicle.ts   # Abstract Sprite base for player vehicles
│   │   ├── Tractor.ts        # Concrete vehicle (small collision box: 64×64)
│   │   ├── Harvester.ts      # Concrete vehicle (large collision box: 128×128)
│   │   ├── isoImage.ts       # Phaser Image subclass with cartesianPointIndex
│   │   ├── InGameUI.ts       # In-game controls modal (Container)
│   │   └── EndGameUI.ts      # Victory modal with star animations (Container)
│   ├── states/
│   │   ├── MenuState.ts      # Pause/menu overlay inside TileScene
│   │   ├── CountDownState.ts # 3-2-1-"Harvest All!" countdown before play
│   │   ├── PlayState.ts      # Active gameplay loop
│   │   └── GameOverState.ts  # Win screen; returns to MenuScene
│   ├── misc/
│   │   ├── CartesianHelper.ts # Coord math: grid creation, iso projection
│   │   └── Controls.ts        # Unified keyboard + gamepad input
│   └── interfaces/
│       ├── image.interface.ts       # IImageConstructor / IIsoImageConstructor
│       └── stateMachine.interface.ts # State + StateMachineInterface
├── assets/                   # Runtime assets (spritesheets, audio, icons)
│   ├── spritesheets/         # gameAssets, uiAssets, uiIngame (PNG + JSON)
│   └── audio/                # MP3 + OGG pairs for all sound effects
├── art/                      # Source art (Affinity Designer, TexturePacker, Tiled)
├── dist/                     # Build output (gitignored)
├── index.html                # Root HTML for dev server (loads dist/bundle.js)
├── webpack.config.js         # Dev build config
├── webpack.production.config.js # Production build (copies assets, generates ZIP)
├── tsconfig.json
└── package.json
```

**Note:** `.js` siblings exist for some `.ts` files (`game.js`, `config.js`, `interfaces/image.interface.js`). These are stale compiled artifacts — do not edit them. The authoritative source is always the `.ts` file.

---

## Architecture

### Dual-Representation (Logic + Render)

Every interactive game object has two representations:

- **Logic object**: an invisible `Phaser.Physics.Arcade.Image` at Cartesian coordinates. Drives physics/collision. Set `alpha = 0`.
- **Render object**: an `IsoImage` or `Vehicle` (Sprite) at the projected isometric screen position. No physics body.

The conversion is done by `CartesianHelper.getCartesianToIsoCoordinate()`.

### Infinite Scroll

`TileScene` holds a `cartesianPoints: Point[]` array. Every frame `updateCartesianTilePoints()` offsets each point by `moveDir * MOVE_SPEED`, then wraps out-of-bounds values back to the opposite edge. Both logic and render objects are repositioned each frame from this array.

### State Machine

`TileScene` implements `StateMachineInterface`. Active states:

```
MenuState → (BUTTON_A) → CountDownState → PlayState
PlayState → (all crops collected) → GameOverState → MenuScene (fresh scene start)
PlayState → (BUTTON_START) → MenuState
```

Each state is a class implementing `State { enter, updateState, exit }`. States own their own `Controls` instance and event listeners. Listeners must be removed in `exit()` to avoid leaks.

### Render Layering

Two `Phaser.GameObjects.Layer` objects within `TileScene`:
- `groundLayer` — static tile images (ground)
- `renderObjectsLayer` — crops, vehicles (depth-sorted by Y each frame via `updateDepthSortIsometrics()`)

### Vehicle Abstraction

`Vehicle` (abstract) → `Tractor` / `Harvester`. Each subclass defines four animation keys (`ANIM_KEY_MOVE_FRONT`, `ANIM_KEY_MOVE_BACK`, `ANIM_KEY_IDLE_FRONT`, `ANIM_KEY_IDLE_BACK`) and implements `createAnimations()`. The vehicle's `name` is always `'player'` to distinguish it in layer filtering.

### Asset Loading Pattern

- `BootScene` preloads only the UI atlas (needed for the loading screen).
- `LoadingScene.loadAssets()` loads all gameplay atlases and audio.
- Atlas keys are static constants on the class that uses them (`TileScene.GAME_ATLAS_KEY`, `LoadingScene.UI_ATLAS_KEY`, `InGameUI.INGAME_UI_KEY`).

---

## Development Workflow

### Adding a new vehicle type

1. Create `src/objects/MyVehicle.ts` extending `Vehicle`.
2. Define the four `ANIM_KEY_*` strings and implement `createAnimations()` and `collisionBodySize` getter following the pattern in `Tractor.ts`.
3. Add the new instance to `TileScene.buildVehicleRoster()` — that is the only method that needs editing.

### Adding a new game state

1. Create `src/states/MyState.ts` implementing `State`.
2. Wire it into the state flow in the appropriate existing state's event listener.
3. Always remove event listeners in `exit()` — `Controls.inputActionEvent` is not auto-cleaned.

### Adding assets

1. Export spritesheets from TexturePacker to `assets/spritesheets/` (JSON Hash format, PNG atlas).
2. Load in `LoadingScene.loadAssets()` using `this.load.atlas(KEY, png, json)`.
3. Define the atlas key as a `static` constant on the class that owns it.

### Validating changes

- Build TypeScript: `npm run build` (production) catches type errors.
- Dev preview: `npm run dev` then open `http://localhost:5555`.
- There is no automated test suite — validate by running the game in a browser.

---

## Coding Standards

### Naming

- Classes: `PascalCase` (e.g. `TileScene`, `CartesianHelper`)
- Files: `kebab-case` for scenes (`tile-scene.ts`, `boot-scene.ts`), `PascalCase` for objects/states/misc
- Constants: `SCREAMING_SNAKE_CASE` for static class members (`GAME_ATLAS_KEY`, `ANIM_KEY_MOVE_FRONT`)
- Private instance fields: `camelCase` with `private` modifier
- Interfaces: prefixed with `I` (`IImageConstructor`)

### TypeScript

- `noImplicitAny: true` — all parameters must be typed.
- Use Phaser type aliases at the top of file with `import X = Phaser.Y.Z` (see `tile-scene.ts` for pattern).
- Avoid `any` unless interfacing with Phaser internals that require it (e.g. `onPlayerCollision` params).

### File Organization

- One class per file.
- Interfaces in `src/interfaces/`.
- Stateless coordinate/math helpers in `src/misc/`.
- Game object classes in `src/objects/`; abstract base classes in `src/objects/base/`.
- State classes in `src/states/`.

### Comments

- Section dividers in long files use `/* --- SECTION NAME --- */` blocks (see `tile-scene.ts`).
- JSDoc only on non-obvious utility methods (`CartesianHelper`).
- Do not comment obvious code.

### Error Handling

No explicit error handling exists beyond TypeScript's static checks. There is no runtime error recovery. Do not add try/catch unless integrating with an external API.

---

## Testing Requirements

**There is no test suite.** Manual browser testing is the only validation path.

Before completing any task:
1. `npm run build` must succeed with zero TypeScript errors.
2. Run `npm run dev` and open `http://localhost:5555` to manually exercise the changed behavior.
3. Verify the full game flow: Boot → Loading → Menu → Countdown → Play → Win → Menu.

---

## Commands

```bash
# Start dev server (also compiles first)
npm run dev
# Dev server: http://localhost:5555

# Production build → dist/ + dist/game.zip
npm run build

# TypeScript type-check only (no emit) — useful for quick validation
npx tsc --noEmit
```

---

## Agent Rules

1. **Follow existing patterns first.** Before introducing a new abstraction, check whether `CartesianHelper`, `Controls`, `Vehicle`, or the state machine already solve the problem.
2. **Atlas key constants belong on the class that owns them.** Do not use string literals for atlas/frame keys inline.
3. **Always remove event listeners in `exit()`.** `Controls.inputActionEvent` listeners accumulate across state transitions if not removed.
4. **Never edit the `.js` siblings** of `.ts` files (`game.js`, `config.js`, etc.). They are stale artifacts.
5. **Dual representation is required for new interactive objects.** A logic `physics.add.image` (invisible) + a render `IsoImage` or `Vehicle` (no physics body) — not one object doing both.
6. **New vehicles must be added to `buildVehicleRoster()` and must implement the `collisionBodySize` getter.** Missing either causes silent incorrect behavior.
7. **New scenes must be added to `GameConfig.scene` array in `config.ts`** in the correct boot order.
8. **Do not modify `dist/`** — it is a build artifact.
9. **Do not add test infrastructure** unless explicitly requested.
10. **Keep scope minimal.** This is a small game with no abstraction layers beyond what exists.

---

## Common Pitfalls

- **Isometric Y-sorting must stay** in `updateDepthSortIsometrics()` — removing it causes vehicles to render under/over crops incorrectly.
- **`moveDir` coordinates are inverted from intuition**: moving "right" sets `moveDir.x = -1`; moving "left" sets `moveDir.x = 1`. This is intentional — the grid scrolls opposite to the player's apparent movement direction.
- **`collisionGroup` members carry a `cartesianIndex` data key** that links them to `cartesianPoints[]`. This index must be preserved when creating new objects via `logicObject.data.set('cartesianIndex', index)`.
- **`IsoImage.name === 'player'`** is used to skip the player during render updates in `renderObjectsLayer`. Any new render object that should scroll with the grid must NOT set `name = 'player'`.
- **Audio objects must not be created before `LoadingScene` completes.** All audio is loaded in `LoadingScene.loadAssets()`; instantiating a `Sound` before that throws.
- **The inner blank area (`INNER_MOST_BLANKS_TILE_SIZE = 9`)** is intentional — it creates a clear center where the player spawns without crops.
- **Production build uses `webpack.production.config.js`**, not `webpack.config.js`. The dev config does not copy assets or generate `index.html` — it serves from the project root statically.
- **`console.log` statements exist in production paths** (`Tractor.ts`, `CountDownState.ts`). Remove them when touching those files rather than adding more.

---

## Definition of Done

- [ ] `npx tsc --noEmit` reports zero errors
- [ ] `npm run build` completes without errors and produces `dist/bundle.js`
- [ ] Game boots in browser: Boot → Loading → Menu displays correctly
- [ ] Changed behavior works end-to-end in the browser at `localhost:5555`
- [ ] No new `console.log` statements introduced
- [ ] Event listeners added in state `enter()` are removed in state `exit()`
- [ ] Atlas keys use static constants, not inline string literals
- [ ] No files in `dist/` were manually edited
- [ ] The `.js` artifact siblings of `.ts` files were not modified