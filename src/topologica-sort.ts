//
// class IsoSpriteSorting {
//     // Define your IsoSpriteSorting class here with the necessary properties and methods
//     // I'm assuming you have defined this class elsewhere in your code.
// }
//
// class TopologicalSort {
//     private static readonly circularDepData: Map<number, boolean> = new Map<number, boolean>();
//     private static readonly circularDepStack: IsoSpriteSorting[] = new Array<IsoSpriteSorting>(64);
//
//     private static readonly visited: Set<number> = new Set<number>();
//     private static readonly allSprites: IsoSpriteSorting[] = new Array<IsoSpriteSorting>(64);
//
//     public static Sort(
//         staticSprites: IsoSpriteSorting[],
//         movableSprites: IsoSpriteSorting[],
//         sorted: IsoSpriteSorting[]
//     ): IsoSpriteSorting[] {
//         TopologicalSort.allSprites.length = 0;
//         TopologicalSort.allSprites.push(...movableSprites);
//         TopologicalSort.allSprites.push(...staticSprites);
//
//         const allSpriteCount = TopologicalSort.allSprites.length;
//
//         for (let i = 0; i < 5; i++) {
//             TopologicalSort.circularDepStack.length = 0;
//             TopologicalSort.circularDepData.clear();
//             let removedDependency = false;
//             for (let j = 0; j < allSpriteCount; j++) {
//                 if (TopologicalSort.RemoveCircularDependencies(TopologicalSort.allSprites[j])) {
//                     removedDependency = true;
//                 }
//             }
//             if (!removedDependency) {
//                 break;
//             }
//         }
//
//         TopologicalSort.visited.clear();
//         for (let i = 0; i < allSpriteCount; i++) {
//             TopologicalSort.Visit(TopologicalSort.allSprites[i], sorted);
//         }
//
//         return sorted;
//     }
//
//     private static Visit(item: IsoSpriteSorting, sorted: IsoSpriteSorting[]): void {
//         const id = item.GetInstanceID();
//         if (!TopologicalSort.visited.has(id)) {
//             TopologicalSort.visited.add(id);
//
//             const dependencies = item.VisibleMovingDependencies;
//             for (let i = 0; i < dependencies.length; i++) {
//                 TopologicalSort.Visit(dependencies[i], sorted);
//             }
//
//             const staticDependencies = item.VisibleStaticDependencies;
//             for (let i = 0; i < staticDependencies.length; i++) {
//                 TopologicalSort.Visit(staticDependencies[i], sorted);
//             }
//
//             sorted.push(item);
//         }
//     }
//
//     private static RemoveCircularDependencies(item: IsoSpriteSorting): boolean {
//         // Implement RemoveCircularDependencies logic
//         // Note: Ensure you define and handle the IsoSpriteSorting class and its methods
//         return false;
//     }
// }
//
// // Define your IsoSpriteSorting class with necessary properties and methods
// // I'm assuming you have defined this class elsewhere in your code.
//
// // Example usage
// const staticSprites: IsoSpriteSorting[] = [];
// const movableSprites: IsoSpriteSorting[] = [];
// const sorted: IsoSpriteSorting[] = [];
//
// const result = TopologicalSort.Sort(staticSprites, movableSprites, sorted);
// console.log(result);
