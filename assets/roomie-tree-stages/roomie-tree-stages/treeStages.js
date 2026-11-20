import tree0 from './tree-stage-1.png';
import tree1 from './tree-stage-2.png';
import tree2 from './tree-stage-3.png';
import tree3 from './tree-stage-4.png';
import tree4 from './tree-stage-5.png';

export const TREE_STAGES = [
  { stage: 1, name: 'Sprout', minimum: 10, image: tree0 },
  { stage: 2, name: 'Seedling', minimum: 20, image: tree1 },
  { stage: 3, name: 'Sapling', minimum: 30, image: tree2 },
  { stage: 4, name: 'Growing tree', minimum: 40, image: tree3 },
  { stage: 5, name: 'Flourishing tree', minimum: 50, image: tree4 },
];

export function getTreeProgress(points) {
  const count = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
  const index = TREE_STAGES.reduce((current, stage, i) => count >= stage.minimum ? i : current, -1);
  const current = TREE_STAGES[index] ?? { stage: 0, name: 'Household tree', minimum: 0, image: null };
  const next = TREE_STAGES[index + 1];
  return {
    ...current,
    remaining: next ? next.minimum - count : 0,
    progress: next ? (count - current.minimum) / (next.minimum - current.minimum) : 1,
  };
}
