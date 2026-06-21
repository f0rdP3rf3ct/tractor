# Plan: GameBridge — Decoupled UI API

## Context

The game currently renders all UI (loading bar, menus, countdown, victory screen) on the Phaser canvas. The existing plan (`html-ui-overlay-plan.md`) migrates this to HTML elements via an internal `UIManager` bundled inside `game.js`.

This plan goes one step further: expose a **window-level CustomEvent API** from the compiled `game.js` so that the HTML/CSS UI can be a completely separate script with zero knowledge of Phaser or any game internals. The UI registers to the browser's native event system; the game bundle translates between its internal Phaser EventEmitter and `window.CustomEvent`. No shared imports, no shared module graph.

The API is kept intentionally minimal: **one event per direction**, each carrying an `action` field in its `detail`. The UI only ever registers one listener.

---

## Architecture

```
┌─────────────── game.js (compiled bundle) ────────────────┐
│  Scenes / States  →  EventBus (Phaser EventEmitter)       │
│                          ↕                                │
│                      GameBridge                           │
│   (translates EventBus ↔ two window CustomEvents)         │
└───────────────────────────────────────────────────────────┘
         ↕  'nsc:game'  { action, ...payload }
         ↕  'nsc:ui'    { action }
┌─────────────── ui.js (separate script, any tech) ─────────┐
│  window.addEventListener('nsc:game', e => {               │
│    switch (e.detail.action) { ... }                       │
│  });                                                      │
│  window.dispatchEvent(new CustomEvent('nsc:ui', {         │
│    detail: { action: 'start-game' }                       │
│  }));                                                     │
└───────────────────────────────────────────────────────────┘
```

### Why one event per direction?

- The UI registers exactly **one** `window.addEventListener('nsc:game', ...)` and switches on `action` — no list of event name strings to maintain
- Adding a new game→UI notification only requires adding a new `action` constant and a switch-case in the UI; no new `addEventListener` call
- Standard browser `CustomEvent` — works with any framework or plain JS
- Timing-safe: the UI registers its single listener synchronously before `window.load` fires

---

## Window API Contract

### Game → UI  (`nsc:game` event, dispatched on `window`)

The `detail` object always contains `action`. Some actions carry additional fields.

| `detail.action` | Extra fields | Emitted by |
|---|---|---|
| `'loading-progress'` | `progress: number` (0–1) | `LoadingScene` |
| `'loading-complete'` | — | `LoadingScene` |
| `'show-menu'` | — | `MenuScene.create()` |
| `'hide-menu'` | — | `MenuScene` (before PlayScene start) |
| `'show-ingame-menu'` | — | `MenuState.enter()` |
| `'hide-ingame-menu'` | — | `MenuState.exit()` |
| `'show-countdown'` | — | `CountDownState.enter()` |
| `'hide-countdown'` | — | `CountDownState.exit()` |
| `'show-victory'` | — | `GameOverState.enter()` |
| `'hide-victory'` | — | `GameOverState.exit()` |

### UI → Game  (`nsc:ui` event, listened by `GameBridge` on `window`)

| `detail.action` | Effect in game |
|---|---|
| `'start-game'` | `MenuScene` starts `PlayScene` |
| `'play-again'` | `GameOverState` returns to menu |
| `'countdown-complete'` | `CountDownState` → `PlayState` |
| `'play-coin-audio'` | triggers `scene.playAudioCoin()` |

---

## New Files

### `src/ui/EventBus.ts`

Singleton `Phaser.Events.EventEmitter` used **internally** by scenes and states. The bridge is the only code that knows about the window event API.

```ts
import 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const UI_EVENTS = {
  LOADING_PROGRESS:  'ui:loading-progress',
  LOADING_COMPLETE:  'ui:loading-complete',
  SHOW_MENU:         'ui:show-menu',
  HIDE_MENU:         'ui:hide-menu',
  SHOW_INGAME_MENU:  'ui:show-ingame-menu',
  HIDE_INGAME_MENU:  'ui:hide-ingame-menu',
  SHOW_COUNTDOWN:    'ui:show-countdown',
  HIDE_COUNTDOWN:    'ui:hide-countdown',
  SHOW_VICTORY:      'ui:show-victory',
  HIDE_VICTORY:      'ui:hide-victory',
} as const;

export const GAME_EVENTS = {
  START_GAME:         'game:start',
  PLAY_AGAIN:         'game:play-again',
  COUNTDOWN_COMPLETE: 'game:countdown-complete',
  PLAY_COIN_AUDIO:    'game:play-coin-audio',
} as const;
```

### `src/ui/GameBridge.ts`

Explicit mapping tables (grep-able, no dynamic string transforms). One `EventBus.on` loop → one `nsc:game` dispatcher. One `window.addEventListener('nsc:ui')` → forwards to EventBus.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from './EventBus';

// Internal bus event → action name in 'nsc:game' CustomEvent
const BUS_TO_ACTION: Record<string, string> = {
  [UI_EVENTS.LOADING_PROGRESS]:  'loading-progress',
  [UI_EVENTS.LOADING_COMPLETE]:  'loading-complete',
  [UI_EVENTS.SHOW_MENU]:         'show-menu',
  [UI_EVENTS.HIDE_MENU]:         'hide-menu',
  [UI_EVENTS.SHOW_INGAME_MENU]:  'show-ingame-menu',
  [UI_EVENTS.HIDE_INGAME_MENU]:  'hide-ingame-menu',
  [UI_EVENTS.SHOW_COUNTDOWN]:    'show-countdown',
  [UI_EVENTS.HIDE_COUNTDOWN]:    'hide-countdown',
  [UI_EVENTS.SHOW_VICTORY]:      'show-victory',
  [UI_EVENTS.HIDE_VICTORY]:      'hide-victory',
};

// action name from 'nsc:ui' CustomEvent → internal GAME_EVENTS bus key
const ACTION_TO_BUS: Record<string, string> = {
  'start-game':         GAME_EVENTS.START_GAME,
  'play-again':         GAME_EVENTS.PLAY_AGAIN,
  'countdown-complete': GAME_EVENTS.COUNTDOWN_COMPLETE,
  'play-coin-audio':    GAME_EVENTS.PLAY_COIN_AUDIO,
};

export function initGameBridge(): void {
  // Game → UI
  Object.entries(BUS_TO_ACTION).forEach(([busEvent, action]) => {
    EventBus.on(busEvent, (payload?: Record<string, unknown>) => {
      window.dispatchEvent(new CustomEvent('nsc:game', {
        detail: { action, ...payload },
      }));
    });
  });

  // UI → Game (single listener for all UI actions)
  window.addEventListener('nsc:ui', (e: Event) => {
    const { action } = (e as CustomEvent<{ action: string }>).detail;
    const busEvent = ACTION_TO_BUS[action];
    if (busEvent) EventBus.emit(busEvent);
  });
}
```

---

## Critical Files to Modify

| File | Change |
|---|---|
| `src/game.ts` | `import { initGameBridge }` + call after `new Game(GameConfig)` |
| `src/scenes/loading-scene.ts` | Replace canvas progress bar with `EventBus.emit(UI_EVENTS.LOADING_PROGRESS, { progress })` / `LOADING_COMPLETE`; remove `this.add.*` calls |
| `src/scenes/menu-scene.ts` | Emit `SHOW_MENU` in `create()`, `HIDE_MENU` before `scene.start`; add `EventBus.once(GAME_EVENTS.START_GAME, ...)` listener; remove all canvas objects + tween |
| `src/states/MenuState.ts` | Replace `new InGameUI(...)` → `emit(SHOW_INGAME_MENU)`; `inGameUI.destroy()` → `emit(HIDE_INGAME_MENU)` |
| `src/states/CountDownState.ts` | `enter()`: emit `SHOW_COUNTDOWN` + `EventBus.once(GAME_EVENTS.COUNTDOWN_COMPLETE, () => scene.changeState(new PlayState(...)))`; remove entire tween chain + container + private methods |
| `src/states/GameOverState.ts` | `enter()`: emit `SHOW_VICTORY` + `once(PLAY_COIN_AUDIO, ...)` + `once(PLAY_AGAIN, ...)` with `_transitioning` guard; `exit()`: emit `HIDE_VICTORY`; remove `EndGameUI` |

## Files to Delete (after migration)

- `src/objects/InGameUI.ts`
- `src/objects/EndGameUI.ts`

---

## Key Implementation Notes

**`CountDownState` transition**: `CountDownState` must not self-advance — it waits for `GAME_EVENTS.COUNTDOWN_COMPLETE` (the external UI dispatches `nsc:ui` with `action: 'countdown-complete'` when its animation finishes). Remove all tween/container private code.

**`GameOverState` double-fire guard**: Both `Controls.BUTTON_A` and `GAME_EVENTS.PLAY_AGAIN` can trigger play-again. Add `private _transitioning = false`, check and set it at the top of the handler.

**`EventBus.once` in `MenuScene`**: Use `once` (not `on`) for `START_GAME` — `MenuScene` is destroyed when `PlayScene` starts, and a persistent `on` listener would zombie across restarts.

**No webpack changes needed**: `GameBridge` is pure TypeScript inside the existing bundle entry.

---

## External UI Example (no imports, one listener)

```js
// ui.js — zero knowledge of Phaser or game internals

// ONE listener for all game events
window.addEventListener('nsc:game', (e) => {
  const { action, progress } = e.detail;
  switch (action) {
    case 'loading-progress':
      document.getElementById('progress-fill').style.width = (progress * 300) + 'px';
      break;
    case 'loading-complete':
      document.getElementById('panel-loading').classList.add('hidden');
      break;
    case 'show-menu':
      document.getElementById('panel-menu').classList.remove('hidden');
      break;
    case 'hide-menu':
      document.getElementById('panel-menu').classList.add('hidden');
      break;
    case 'show-countdown':
      runCountdownAnimation(() => {
        window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action: 'countdown-complete' } }));
      });
      break;
    case 'show-victory':
      document.getElementById('panel-victory').classList.remove('hidden');
      break;
  }
});

// Send actions to the game (same pattern for all)
function sendToGame(action) {
  window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action } }));
}

document.getElementById('btn-start').addEventListener('click', () => sendToGame('start-game'));
document.getElementById('btn-play-again').addEventListener('click', () => sendToGame('play-again'));
```

---

## Verification

1. `npx tsc --noEmit` — zero type errors
2. `npm run dev`, open `http://localhost:5555`
3. Walk the full flow: Boot → Loading → Menu → Countdown → Play → Win → Menu
4. From the browser console, test the API manually:
   - `window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action: 'start-game' } }))` starts the game from the menu
   - `window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action: 'play-again' } }))` returns to menu from victory
5. Confirm no canvas UI objects remain (loading bar, menu logo/buttons, countdown numbers, victory modal)
