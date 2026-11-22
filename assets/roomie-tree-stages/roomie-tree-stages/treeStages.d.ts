export type TreeStage = { stage: number; name: string; minimum: number; image: string | number };
export const TREE_STAGES: TreeStage[];
export function getTreeProgress(points: number): (TreeStage | { stage: 0; name: string; minimum: 0; image: null }) & { remaining: number; progress: number };
