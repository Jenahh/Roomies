import Icon from '../../components/dashboard/DashboardIcon';
import { choreLooks, chorePresets, getChoreLook, type ChoreLook } from '../../data/chorePresets';
import './chorePresets.css';

export function ChoreBadge({ look, title, muted = false }: { look?: ChoreLook; title?: string; muted?: boolean }) {
  const style = getChoreLook(look, title);
  return <span className="chore-badge" aria-hidden="true" style={{ background: muted ? '#E2E2E2' : style.tint }}><Icon name={style.icon} color={muted ? '#626262' : style.ink} size={18} /></span>;
}

export function ChorePresets({ onPick, selected }: { selected?: ChoreLook; onPick: (preset: typeof chorePresets[number]) => void }) {
  return <div className="chore-presets" role="group" aria-label="Chore presets">
    {chorePresets.map(preset => <button type="button" key={preset.look} aria-pressed={selected === preset.look} onClick={() => onPick(preset)}>
      <ChoreBadge look={preset.look} />{choreLooks[preset.look].label}
    </button>)}
  </div>;
}
