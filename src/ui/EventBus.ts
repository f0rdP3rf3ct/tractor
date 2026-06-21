import 'Phaser';

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
    START_PLAY:         'game:start-play',
    PLAY_AGAIN:         'game:play-again',
    COUNTDOWN_COMPLETE: 'game:countdown-complete',
} as const;
