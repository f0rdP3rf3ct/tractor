export const IS_DEBUG: boolean = typeof DEBUG !== 'undefined' && DEBUG;
export let showPhysicsBodies: boolean = IS_DEBUG;

export function togglePhysicsBodies(): void {
    showPhysicsBodies = !showPhysicsBodies;
}
