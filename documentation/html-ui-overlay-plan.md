# Plan: HTML/CSS UI Overlay for Non-Stop Crops

## Context

All game UI (menus, loading bar, countdown, victory screen) is currently rendered as Phaser GameObjects on the canvas. This makes it hard to use modern CSS/HTML techniques. The goal is to move all UI to HTML elements positioned over the canvas, with Phaser and the HTML layer communicating via a shared event bus.

The state machine, Controls input system, and game logic stay completely intact — only the rendering layer changes.

---

## Architecture

### Event Bus

**New file:** `src/ui/EventBus.ts`

A module-singleton wrapping `Phaser.Events.EventEmitter` (already in the bundle). Exported as a constant `EventBus` with two event namespaces:

- `UI_EVENTS` — Phaser → HTML (show/hide panels, progress updates)
- `GAME_EVENTS` — HTML → Phaser (button clicks, countdown complete, play coin audio)

```ts
export const EventBus = new Phaser.Events.EventEmitter();

export const UI_EVENTS = {
  LOADING_PROGRESS: 'ui:loading-progress',  // payload: number (0–1)
  LOADING_COMPLETE: 'ui:loading-complete',
  SHOW_MENU:        'ui:show-menu',
  HIDE_MENU:        'ui:hide-menu',
  SHOW_INGAME_MENU: 'ui:show-ingame-menu',
  HIDE_INGAME_MENU: 'ui:hide-ingame-menu',
  SHOW_COUNTDOWN:   'ui:show-countdown',
  HIDE_COUNTDOWN:   'ui:hide-countdown',
  SHOW_VICTORY:     'ui:show-victory',
  HIDE_VICTORY:     'ui:hide-victory',
} as const;

export const GAME_EVENTS = {
  START_GAME:          'game:start',
  PLAY_AGAIN:          'game:play-again',
  COUNTDOWN_COMPLETE:  'game:countdown-complete',
  PLAY_COIN_AUDIO:     'game:play-coin-audio',
} as const;
```

### HTML Overlay Structure

Inside `src/index.html`, add `#ui-overlay` as a child of `#game` (so it naturally overlays the canvas):

```html
<div id="game">
  <!-- Phaser appends <canvas> here -->
  <div id="ui-overlay">
    <div id="panel-loading"     class="panel hidden"></div>
    <div id="panel-menu"        class="panel hidden"></div>
    <div id="panel-ingame-menu" class="panel hidden"></div>
    <div id="panel-countdown"   class="panel hidden"></div>
    <div id="panel-victory"     class="panel hidden"></div>
  </div>
</div>
```

CSS: `#game { position: relative }`, `#ui-overlay { position: absolute; top: 0; left: 0; width: 800px; height: 600px; pointer-events: none; overflow: hidden }`. Panels that need clicks set `pointer-events: auto` on interactive children.

### UIManager

**New file:** `src/ui/UIManager.ts`

Instantiated once in `src/game.ts` after `new Game(GameConfig)`. Responsibilities:
- Injects inner HTML for all panels into their placeholder divs
- Provides `show(id)` / `hide(id)` helpers (toggles CSS class `hidden`)
- Listens to all `UI_EVENTS` and delegates to the relevant panel

### Panel Files

```
src/ui/
  EventBus.ts
  UIManager.ts
  panels/
    LoadingPanel.ts
    MenuPanel.ts
    InGameMenuPanel.ts
    CountDownPanel.ts
    VictoryPanel.ts
  ui.css
```

Each Panel class receives the DOM div it owns and wires up its internal behavior.

### CSS Animations (replacing Phaser tweens)

| Effect | CSS |
|---|---|
| Logo sine-bob | `@keyframes logo-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(20px)} }` — `animation: logo-bob 1s ease-in-out infinite` |
| "Hit space" pulse | `@keyframes pulse-opacity { 0%,100%{opacity:1} 50%{opacity:0} }` |
| Countdown scale+fade | `@keyframes cd-pop { 0%{transform:scale(1);opacity:1} 16%{transform:scale(1.5);opacity:1} 100%{transform:scale(1.5);opacity:0} }` — triggered sequentially via `animationend` |
| Star pop-in (×3) | `@keyframes star-pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }` — stars start hidden, get class added with 0/300ms/600ms delay |

---

## Migration Steps (in order)

### 1 — EventBus + UIManager skeleton
Create `EventBus.ts` and `UIManager.ts`. Instantiate UIManager in `game.ts`. No visual changes yet — just wiring.

### 2 — HTML + CSS base
Add `#ui-overlay` to `src/index.html`. Add `src/ui/ui.css` with panel layout rules. Add `#game { position: relative }` to the existing stylesheet.

### 3 — LoadingScene → LoadingPanel
- Remove `progressBar` graphics and background/label GameObjects from `loading-scene.ts`
- Emit `UI_EVENTS.LOADING_PROGRESS` from `this.load.on('progress', …)` and `UI_EVENTS.LOADING_COMPLETE` from `this.load.on('complete', …)`
- `LoadingPanel` renders background + label as `<img>` tags; updates `<div id="progress-fill">` width via inline style

### 4 — MenuScene → MenuPanel
- `MenuScene.create()` emits `UI_EVENTS.SHOW_MENU`; before `scene.start('PlayScene')` emits `UI_EVENTS.HIDE_MENU`
- Remove all `this.add.*` calls from `MenuScene` (logo, buttons, arrow)
- `MenuPanel` renders logo + buttons as `<img>` tags, arrow position updated via `setSelection(index)`
- `MenuScene` still owns `Controls`; up/down events call `menuPanel.setSelection()` directly via UIManager reference; BUTTON_A still triggers `this.scene.start('PlayScene')`
- HTML "New Game" button click fires `GAME_EVENTS.START_GAME`; `MenuScene` listens to this as an alternative input path alongside Controls

### 5 — MenuState → InGameMenuPanel
- `MenuState.enter()`: replace `new InGameUI(…)` with `EventBus.emit(UI_EVENTS.SHOW_INGAME_MENU)`
- `MenuState.exit()`: replace `inGameUI.destroy()` with `EventBus.emit(UI_EVENTS.HIDE_INGAME_MENU)`
- Delete `src/objects/InGameUI.ts`
- `InGameMenuPanel`: modal background, title, keyboard controls image, pulsing "hit space" — all `<img>` + CSS

### 6 — CountDownState → CountDownPanel
- `CountDownState.enter()`: replace all tween/container code with `EventBus.emit(UI_EVENTS.SHOW_COUNTDOWN)`
- `CountDownState.exit()`: emit `UI_EVENTS.HIDE_COUNTDOWN`
- `CountDownPanel` runs the sequential CSS animation chain; on final `animationend` emits `GAME_EVENTS.COUNTDOWN_COMPLETE`
- `CountDownState.enter()` adds a one-time listener: `EventBus.once(GAME_EVENTS.COUNTDOWN_COMPLETE, () => scene.changeState(new PlayState(scene)))`

### 7 — GameOverState → VictoryPanel
- `GameOverState.enter()`: replace `new EndGameUI(…)` with `EventBus.emit(UI_EVENTS.SHOW_VICTORY)`
- `GameOverState.exit()`: emit `UI_EVENTS.HIDE_VICTORY`
- `VictoryPanel`: modal + victory title + 3 stars (CSS pop-in with staggered delay) + harvester image
- `VictoryPanel` emits `GAME_EVENTS.PLAY_COIN_AUDIO` when the first star animation fires; `GameOverState` listens and calls `scene.playAudioCoin()`
- HTML "Play Again" click fires `GAME_EVENTS.PLAY_AGAIN`; `GameOverState` listens alongside existing Controls BUTTON_A path (guard flag prevents double-transition)
- Delete `src/objects/EndGameUI.ts`

### 8 — Cleanup
- Remove `uiIngame` atlas preload from `LoadingScene` if individual PNGs are used directly
- Remove `uiAssets` atlas preload from `BootScene` if those assets have moved to HTML (verify nothing else uses them first)
- Remove stale imports

---

## Asset Strategy for HTML

Reference individual PNG source files directly from `art/ui_ingame/` and `art/ui/` (they exist as source files pre-atlasing). Import them as Webpack asset resources (`import bgUrl from '…'`) with an `asset/resource` rule in webpack configs — this handles paths correctly in both dev and prod without manual CopyPlugin changes.

---

## Webpack Changes

1. Add `asset/resource` rule for PNG imports in both `webpack.config.js` and `webpack.production.config.js`
2. Add `css-loader` + `style-loader` rule (or import `ui.css` directly from `UIManager.ts`)
3. Add `HtmlWebpackPlugin` pointing at `src/index.html` as template — so the `#ui-overlay` markup appears in `dist/index.html` automatically

---

## Critical Files to Modify

- `src/index.html` — add overlay div
- `src/game.ts` — instantiate UIManager
- `src/scenes/loading-scene.ts` — remove canvas UI, emit progress events
- `src/scenes/menu-scene.ts` — remove canvas UI, emit show/hide events
- `src/states/MenuState.ts` — replace InGameUI with bus events
- `src/states/CountDownState.ts` — replace tween chain with bus events + COUNTDOWN_COMPLETE listener
- `src/states/GameOverState.ts` — replace EndGameUI with bus events + coin audio listener
- `webpack.config.js` + `webpack.production.config.js` — asset/resource + CSS loader
- `assets/styles/css/style.css` — add `#game { position: relative }`

## New Files

- `src/ui/EventBus.ts`
- `src/ui/UIManager.ts`
- `src/ui/panels/LoadingPanel.ts`
- `src/ui/panels/MenuPanel.ts`
- `src/ui/panels/InGameMenuPanel.ts`
- `src/ui/panels/CountDownPanel.ts`
- `src/ui/panels/VictoryPanel.ts`
- `src/ui/ui.css`

## Files to Delete (after migration)

- `src/objects/InGameUI.ts`
- `src/objects/EndGameUI.ts`

---

## Verification

Run `npm run dev`, open `http://localhost:5555`, and walk the full flow:

1. **Boot → Loading**: progress bar animates in HTML, no canvas progress graphics
2. **Menu**: logo bobs, arrow moves with keyboard/gamepad, "New Game" click works
3. **In-game menu (MenuState)**: modal appears over the isometric field, "hit space" pulses
4. **Countdown**: 3→2→1→"Harvest All!" animates, then gameplay starts automatically
5. **Win**: stars pop in with stagger, coin audio plays on first star, "Play Again" returns to menu
6. Run `npx tsc --noEmit` — zero type errors
