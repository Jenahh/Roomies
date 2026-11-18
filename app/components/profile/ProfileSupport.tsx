import { useState } from 'react';
import RoomiePet from '../RoomiePet';
import './ProfileSupport.css';
import { Droplets, Zap, Thermometer, Refrigerator, Wrench, Users, Volume2, Heart, MessageCircle, ChevronRight, History, Lock, Calendar } from 'lucide-react';

type SupportKind = 'maintenance' | 'ra';
type Props = {
  onMaintenance: (category: string) => void;
  onContactRA: (category: string) => void;
  onMaintenanceHistory: () => void;
  onRAHistory: () => void;
  color?: string;
};
const options = {
  maintenance: [
    { label: 'Plumbing', icon: Droplets },
    { label: 'Electrical', icon: Zap },
    { label: 'Heating & cooling', icon: Thermometer },
    { label: 'Appliances', icon: Refrigerator },
    { label: 'Doors & locks', icon: Lock },
    { label: 'General repair', icon: Wrench },
    { label: 'Other', icon: Wrench },
  ],
  ra: [
    { label: 'Roommate conflict', icon: Users },
    { label: 'Noise complaint', icon: Volume2 },
    { label: 'Personal support', icon: Heart },
    { label: 'General support', icon: MessageCircle },
    { label: 'Schedule a conversation', icon: Calendar },
    { label: 'Other', icon: MessageCircle },
  ],
};
export default function ProfileSupport({ onMaintenance, onContactRA, onMaintenanceHistory, onRAHistory, color }: Props) {
  const [active, setActive] = useState<SupportKind | null>(null);
  return (
    <section className="support-section">
      <h2>Need a hand?</h2>
      <p className="support-subtitle">Report an issue or reach out to your RA.</p>
      <div className="support-grid">
        <button className="support-card maintenance-card" onClick={() => setActive('maintenance')}>
          <div className="card-mascot"><RoomiePet role="property-manager" color={color} size={85} /></div>
          <span>Maintenance issue</span><span className="support-arrow">→</span>
        </button>
        <button className="support-card ra-card" onClick={() => setActive('ra')}>
          <div className="card-mascot"><RoomiePet role="assistant" color={color} size={85} /></div>
          <span>Contact my RA</span><span className="support-arrow">→</span>
        </button>
      </div>
      {active && (
        <div className="support-backdrop" onClick={() => setActive(null)}>
          <div className="support-popup" role="dialog" aria-modal="true" aria-labelledby="support-question" onClick={event => event.stopPropagation()}>
            <button className="popup-close" aria-label="Close" onClick={() => setActive(null)}>×</button>
            <div className="mascot-speech">
              <h3>{active === 'maintenance' ? 'Let’s get that fixed!' : 'Hey, Roomie!'}</h3>
              <p id="support-question">{active === 'maintenance' ? 'What maintenance issue would you like to report?' : 'What would you like to talk to your RA about?'}</p>
            </div>
            <div className="popup-mascot"><RoomiePet role={active === 'maintenance' ? 'property-manager' : 'assistant'} color={color} size={125} /></div>
            <div className="support-options">
              {options[active].map((option, index) => (
                <button key={option.label} className="support-option" style={{ animationDelay: `${200 + index * 90}ms` }} onClick={() => {
                  setActive(null);
                  if (active === 'maintenance') onMaintenance(option.label);
                  else onContactRA(option.label);
                }}>
                  <div className="option-content"><div className="option-icon"><option.icon size={20} /></div><span className="option-label">{option.label}</span></div>
                  <ChevronRight size={18} color="#7885D9" />
                </button>
              ))}
              <div className="history-divider" />
              <button className="support-option history-option" onClick={() => {
                setActive(null);
                if (active === 'maintenance') onMaintenanceHistory();
                else onRAHistory();
              }}>
                <div className="option-content"><div className="option-icon"><History size={20} /></div><span className="option-label">{active === 'maintenance' ? 'Request history' : 'Message history'}</span></div>
                <ChevronRight size={18} color="#7885D9" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
