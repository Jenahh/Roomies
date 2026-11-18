export type TreeStage = { stage: number; name: string; minimum: number; image: string | number };
export const TREE_STAGES: TreeStage[];
export function getTreeProgress(completions: number): TreeStage & { remaining: number; progress: number };
