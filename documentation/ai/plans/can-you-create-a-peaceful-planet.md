# Plan: Strip All Phaser Canvas UI

## Context

All current UI (loading bar, menu graphics, in-game controls overlay, countdown animation, victory modal) is rendered as Phaser `GameObjects` on the canvas. The future plan (`concerning-the-html-ui-is-hidden-moth.md`) replaces all of this with a fully decoupled HTML layer via `GameBridge` + window `CustomEvent`s.

This is **step 1 of 2**: remove the Phaser UI layer entirely so the codebase is a clean slate for the HTML UI to wire into. No EventBus, no GameBridge, no HTML panels yet — just deletion and simplification.

The game **must stay fully playable** after this step. All state transitions and audio remain functional; the canvas just goes dark/blank where UI used to be.

---

## What to Remove

All Phaser `GameObjects` used purely for display:
- Canvas progress bar in `LoadingScene.preload()`
- Background/logo/button/arrow images in `MenuScene.create()`
- `InGameUI` container (controls overlay) in `MenuState`
- Countdown animation container + tween chain in `CountDownState`
- `EndGameUI` container (victory modal) in `GameOverState`
- `inGameUi` atlas load (no longer referenced once the objects above are gone)

## What to Preserve

- State machine flow (all transitions remain)
- `Controls` input in every state/scene (keyboard still drives the game)
- `playAudioCoin()` on `PlayScene` — called by `GameOverState`, needed by GameBridge plan
- `LoadingScene.loadAssets()` for all game sprites and audio
- `BootScene` and the `uiAssets` atlas — BootScene still loads it (GameBridge plan removes it in step 2)
- All crop/physics/rendering logic

---

## Files to Delete

| File | Why |
|---|---|
| `src/objects/InGameUI.ts` | Phaser canvas overlay; no longer rendered; listed as delete in GameBridge plan |
| `src/objects/EndGameUI.ts` | Phaser canvas overlay; no longer rendered; listed as delete in GameBridge plan |

---

## Files to Modify

### 1. `src/scenes/loading-scene.ts`

Remove from `preload()`:
- `this.add.image(...)` background and loading image
- `const progressBar = this.add.graphics()`
- Both `this.load.on('progress', ...)` and `this.load.on('complete', ...)` callbacks

Remove from `loadAssets()`:
- `this.load.atlas(InGameUI.INGAME_UI_KEY, ...)` — atlas unused after UI removal

Remove import:
- `import {InGameUI} from "../objects/InGameUI"`

Keep:
- `create()` → `this.scene.start('MenuScene')`
- All other `this.load.*` calls (game atlas, all audio)

---

### 2. `src/scenes/menu-scene.ts`

Remove from `create()`:
- All `this.add.*` calls (background, logo, buttons, selection arrow)
- Logo tween (`this.tweens.add(...)`)
- Call to `this.updateAxisSelection(0)`

Remove class properties:
- `logo`, `buttonNewGameImage`, `buttonControlsImage`, `selectionArrowImage`
- `selections`, `currentSelectionIndex`, `buttonIsDown`

Remove methods:
- `updateAxisSelection(dir: number)`

Keep:
- `Controls` setup and the `inputActionEvent` listener for `BUTTON_A` → `this.scene.start('PlayScene')`
- `update()` calling `updateControls()`
- `updateControls()` — but simplify: remove axis direction checks (`up()`, `down()`, `noAxisIsPressed()`), keep only `this.controls.update()` (needed for gamepad polling)

---

### 3. `src/states/MenuState.ts`

Remove:
- `import {InGameUI} from "../objects/InGameUI"`
- `private inGameUI: InGameUI` property
- `new InGameUI(...)` and `this.scene.add.existing(...)` in `enter()`
- `this.inGameUI.destroy()` in `exit()`

Keep everything else as-is (Controls, `BUTTON_A` → `CountDownState`).

---

### 4. `src/states/CountDownState.ts`

Replace the entire tween/container system with a single `time.delayedCall` placeholder.

Remove:
- `import {InGameUI} from "../objects/InGameUI"`
- `private animContainer: Container` property
- `private currentAnimIndex: number` property
- All Phaser type imports (`Image`, `Container`, `TweenChainBuilderConfig`)
- `createAssets()`, `getImageAt()`, `animateImageAt()` methods

Change `enter()`:
```ts
enter(stateMachine: StateMachineInterface): void {
    this.scene.time.delayedCall(4000, () => {
        this.scene.changeState(new PlayState(this.scene));
    });
}
```

Change `exit()`:
- Remove `this.animContainer.destroy()` — nothing to destroy anymore; leave `exit()` as an empty method

This 4-second delay matches the original visual countdown duration and serves as a placeholder until the HTML countdown fires `countdown-complete`.

---

### 5. `src/states/GameOverState.ts`

Remove:
- `import {EndGameUI} from "../objects/EndGameUI"`
- `private endGameUI: EndGameUI` property
- `new EndGameUI(...)` and `this.scene.add.existing(...)` in `enter()`
- `this.endGameUI.destroy()` in `exit()`

Keep everything else (Controls, `BUTTON_A` → `scene.shutDown()` + `scene.start('MenuScene')`).

---

## Verification

1. `npx tsc --noEmit` — zero type errors
2. `npm run dev`, open `http://localhost:5555`
3. Walk the full flow:
   - **Boot** → blank loading screen (progress bar gone, background gone)
   - **Menu** → blank canvas, press Space/A → starts game
   - **Countdown** → blank canvas, 4-second pause, then farming begins
   - **Play** → game works normally (crops, tractor/harvester, scroll)
   - **Win** → blank victory screen, press Space/A → back to blank menu
4. Confirm no TypeScript errors referencing `InGameUI` or `EndGameUI`
