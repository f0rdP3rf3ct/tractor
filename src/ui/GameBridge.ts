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
