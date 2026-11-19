import { choreLooks, chorePresets, type ChoreLook } from '../../data/chorePresets';
import './chorePresets.css';

import { ChoreBadge } from './ChoreBadge';

export { ChoreBadge };

export function ChorePresets({ onPick, selected }: { selected?: ChoreLook; onPick: (preset: typeof chorePresets[number]) => void }) {
  return <div className="chore-presets" role="group" aria-label="Chore presets">
    {chorePresets.map(preset => <button type="button" key={preset.look} aria-pressed={selected === preset.look} onClick={() => onPick(preset)}>
      <ChoreBadge look={preset.look} />{choreLooks[preset.look].label}
    </button>)}
  </div>;
}
