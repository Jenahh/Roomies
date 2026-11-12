import Icon from '../../components/dashboard/DashboardIcon';
import { choreLooks, chorePresets, getChoreLook, type ChoreLook } from '../../data/chorePresets';
import './chorePresets.css';

export function ChoreBadge({ look, title }: { look?: ChoreLook; title?: string }) {
  const style = getChoreLook(look, title);
  return <span className="chore-badge" aria-hidden="true" style={{ background: style.tint }}><Icon name={style.icon} color={style.ink} size={18} /></span>;
}

export function ChorePresets({ onPick }: { onPick: (preset: typeof chorePresets[number]) => void }) {
  return <div className="chore-presets" role="group" aria-label="Chore presets">
    {chorePresets.map(preset => <button type="button" key={preset.look} onClick={() => onPick(preset)}>
      <ChoreBadge look={preset.look} />{choreLooks[preset.look].label}
    </button>)}
  </div>;
}
