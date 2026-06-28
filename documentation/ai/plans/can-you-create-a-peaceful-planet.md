# Plan: Implement GameBridge + Functional HTML UI

## Context

The Phaser canvas UI was removed in the previous step (all `InGameUI`, `EndGameUI`, countdown tweens, and loading graphics are gone). This plan wires up the `GameBridge` architecture described in `concerning-the-html-ui-is-hidden-moth.md` and adds a **functional but unstyled** HTML UI in `src/index.html`. The user will handle all visual styling separately.

The game-side emits internal events via a singleton `EventBus`. `GameBridge` translates those to `window.CustomEvent`s. The HTML UI script listens to one event (`nsc:game`) and sends one event (`nsc:ui`). Neither side knows about the other's internals.

One addition beyond the original plan: a `'start-play'` UI→Game action is needed so the in-game controls panel has a functional "Play!" HTML button (alongside the keyboard shortcut).

---

## New Files

### `src/ui/EventBus.ts`

Singleton Phaser EventEmitter + typed event-name constants.

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
  START_PLAY:         'game:start-play',   // ← addition: triggers MenuState → CountDownState
  PLAY_AGAIN:         'game:play-again',
  COUNTDOWN_COMPLETE: 'game:countdown-complete',
} as const;
```

### `src/ui/GameBridge.ts`

Explicit bidirectional mapping tables. Exactly as in the source plan, with `start-play` added to `ACTION_TO_BUS`.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from './EventBus';

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

const ACTION_TO_BUS: Record<string, string> = {
  'start-game':         GAME_EVENTS.START_GAME,
  'start-play':         GAME_EVENTS.START_PLAY,
  'play-again':         GAME_EVENTS.PLAY_AGAIN,
  'countdown-complete': GAME_EVENTS.COUNTDOWN_COMPLETE,
};

export function initGameBridge(): void {
  Object.entries(BUS_TO_ACTION).forEach(([busEvent, action]) => {
    EventBus.on(busEvent, (payload?: Record<string, unknown>) => {
      window.dispatchEvent(new CustomEvent('nsc:game', {
        detail: { action, ...payload },
      }));
    });
  });

  window.addEventListener('nsc:ui', (e: Event) => {
    const { action } = (e as CustomEvent<{ action: string }>).detail;
    const busEvent = ACTION_TO_BUS[action];
    if (busEvent) EventBus.emit(busEvent);
  });
}
```

---

## Modified TypeScript Files

### `src/game.ts`

Add `import { initGameBridge } from './ui/GameBridge'` and call `initGameBridge()` after `new Game(GameConfig)`.

### `src/scenes/loading-scene.ts`

In `preload()`, restore the `load.on('progress', ...)` and `load.on('complete', ...)` handlers — but emit on `EventBus` instead of drawing canvas graphics:

```ts
import { EventBus, UI_EVENTS } from '../ui/EventBus';

// in preload():
this.load.on('progress', (value: number) => {
    EventBus.emit(UI_EVENTS.LOADING_PROGRESS, { progress: value });
});
this.load.on('complete', () => {
    EventBus.emit(UI_EVENTS.LOADING_COMPLETE);
});
```

### `src/scenes/menu-scene.ts`

Both keyboard (BUTTON_A) and the HTML button go through `EventBus.emit(GAME_EVENTS.START_GAME)`. The scene listens via `EventBus.once` to guarantee a single transition and no zombie listener across restarts.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from '../ui/EventBus';

create() {
    EventBus.emit(UI_EVENTS.SHOW_MENU);

    this.controls = new Controls(this);
    this.controls.inputActionEvent.addListener(Controls.INPUT_ACTION_EVENT_KEY, (key: string) => {
        if (key === Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A) {
            EventBus.emit(GAME_EVENTS.START_GAME);
        }
    });

    EventBus.once(GAME_EVENTS.START_GAME, () => {
        EventBus.emit(UI_EVENTS.HIDE_MENU);
        this.scene.start('PlayScene');
    });
}

update(_time: number, _delta: number) {
    this.controls.update();
}
```

Remove all canvas-object properties and `updateAxisSelection` / `updateControls` (already gone from prior step).

### `src/states/MenuState.ts`

BUTTON_A now emits `START_PLAY` on the bus (instead of calling `changeState` directly). The state's `EventBus.once` listener handles the transition — unifying keyboard and HTML button through one path.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from '../ui/EventBus';

enter(stateMachine): void {
    this.scene.getInputState().moveDir.setTo(0, 0);
    EventBus.emit(UI_EVENTS.SHOW_INGAME_MENU);
    EventBus.once(GAME_EVENTS.START_PLAY, () => {
        this.scene.changeState(new CountDownState(this.scene));
    });
    this.addEventListeners();  // Controls listener emits START_PLAY on bus
}

exit(): void {
    EventBus.removeListener(GAME_EVENTS.START_PLAY);
    EventBus.emit(UI_EVENTS.HIDE_INGAME_MENU);
    this.removeEventListeners();
}

// Controls listener:
case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
    EventBus.emit(GAME_EVENTS.START_PLAY);
```

### `src/states/CountDownState.ts`

Remove the 4-second `delayedCall` placeholder. Replace with EventBus listener for `COUNTDOWN_COMPLETE`. The HTML countdown fires this when its animation ends.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from '../ui/EventBus';

enter(stateMachine): void {
    EventBus.emit(UI_EVENTS.SHOW_COUNTDOWN);
    EventBus.once(GAME_EVENTS.COUNTDOWN_COMPLETE, () => {
        this.scene.changeState(new PlayState(this.scene));
    });
}

exit(): void {
    EventBus.removeListener(GAME_EVENTS.COUNTDOWN_COMPLETE);
    EventBus.emit(UI_EVENTS.HIDE_COUNTDOWN);
}
```

### `src/states/GameOverState.ts`

BUTTON_A emits `PLAY_AGAIN` on the bus. `EventBus.once` handles the transition. Coin audio is called directly in `enter()` (no HTML star animation in the basic UI). `_transitioning` guard prevents double-fire if both keyboard and button fire quickly.

```ts
import { EventBus, UI_EVENTS, GAME_EVENTS } from '../ui/EventBus';

private _transitioning = false;

enter(stateMachine): void {
    this._transitioning = false;
    EventBus.emit(UI_EVENTS.SHOW_VICTORY);
    this.scene.playAudioCoin();
    EventBus.once(GAME_EVENTS.PLAY_AGAIN, () => {
        if (this._transitioning) return;
        this._transitioning = true;
        this.scene.shutDown();
        this.scene.scene.start('MenuScene');
    });
    this.addEventListeners();  // Controls listener emits PLAY_AGAIN on bus
}

exit(): void {
    EventBus.removeListener(GAME_EVENTS.PLAY_AGAIN);
    EventBus.emit(UI_EVENTS.HIDE_VICTORY);
    this.removeEventListeners();
}

// Controls listener:
case Controls.INPUT_ACTION_EVENT_KEY_BUTTON_A:
    EventBus.emit(GAME_EVENTS.PLAY_AGAIN);
```

---

## HTML UI — `src/index.html`

Add five panels inside a `<div id="ui-overlay">` (placed inside `#container`, after `#game`). The loading panel is visible on load; all others start hidden.

**Panels:**

```html
<div id="ui-overlay">

  <div id="panel-loading">
    <p>Loading…</p>
    <progress id="progress-bar" value="0" max="100"></progress>
  </div>

  <div id="panel-menu" hidden>
    <h1>Non-Stop Crops</h1>
    <button id="btn-start">Start Game</button>
  </div>

  <div id="panel-ingame-menu" hidden>
    <h2>Controls</h2>
    <p>Arrow keys / WASD — steer the vehicle</p>
    <p>Harvest all crops to win!</p>
    <button id="btn-play">Play!</button>
  </div>

  <div id="panel-countdown" hidden>
    <p id="countdown-text"></p>
  </div>

  <div id="panel-victory" hidden>
    <h2>You Win!</h2>
    <button id="btn-play-again">Play Again</button>
  </div>

</div>
```

**Inline `<script>` (before `</body>`):**

```js
(function () {
  function sendToGame(action) {
    window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action: action } }));
  }

  var panelLoading    = document.getElementById('panel-loading');
  var panelMenu       = document.getElementById('panel-menu');
  var panelIngameMenu = document.getElementById('panel-ingame-menu');
  var panelCountdown  = document.getElementById('panel-countdown');
  var panelVictory    = document.getElementById('panel-victory');
  var progressBar     = document.getElementById('progress-bar');
  var countdownText   = document.getElementById('countdown-text');

  document.getElementById('btn-start').addEventListener('click', function () { sendToGame('start-game'); });
  document.getElementById('btn-play').addEventListener('click', function () { sendToGame('start-play'); });
  document.getElementById('btn-play-again').addEventListener('click', function () { sendToGame('play-again'); });

  function runCountdown() {
    var steps = ['3', '2', '1', 'Go!'];
    var i = 0;
    countdownText.textContent = steps[0];
    var interval = setInterval(function () {
      i++;
      if (i < steps.length) {
        countdownText.textContent = steps[i];
      } else {
        clearInterval(interval);
        panelCountdown.hidden = true;
        sendToGame('countdown-complete');
      }
    }, 1000);
  }

  window.addEventListener('nsc:game', function (e) {
    var action   = e.detail.action;
    var progress = e.detail.progress;
    switch (action) {
      case 'loading-progress':  progressBar.value = Math.round(progress * 100); break;
      case 'loading-complete':  panelLoading.hidden = true; break;
      case 'show-menu':         panelMenu.hidden = false; break;
      case 'hide-menu':         panelMenu.hidden = true; break;
      case 'show-ingame-menu':  panelIngameMenu.hidden = false; break;
      case 'hide-ingame-menu':  panelIngameMenu.hidden = true; break;
      case 'show-countdown':    panelCountdown.hidden = false; runCountdown(); break;
      case 'hide-countdown':    panelCountdown.hidden = true; break;
      case 'show-victory':      panelVictory.hidden = false; break;
      case 'hide-victory':      panelVictory.hidden = true; break;
    }
  });
}());
```

---

## Framework Decision

Vanilla JS (no framework). The inline script in `src/index.html` is the UI layer — show/hide panels via the `hidden` attribute, driven by `nsc:game` CustomEvents. User handles all styling via `assets/styles/css/style.css`.

---

## Verification

1. `npx tsc --noEmit` — zero new errors (pre-existing Phaser type errors in `node_modules/` are acceptable)
2. `npm run dev`, open `http://localhost:5555`
3. Walk the full flow:
   - **Loading**: progress bar fills, panel hides automatically
   - **Menu**: "Non-Stop Crops" heading + "Start Game" button appears; click it OR press Space
   - **In-game menu**: controls text + "Play!" button; click it OR press Space
   - **Countdown**: 3 → 2 → 1 → Go! displayed in HTML, then gameplay starts
   - **Play**: game runs normally (tractor, crops, scroll)
   - **Victory**: "You Win!" + "Play Again" button; click it OR press Space → back to menu
4. Console test: `window.dispatchEvent(new CustomEvent('nsc:ui', { detail: { action: 'start-game' } }))` while on the menu panel — should start the game
