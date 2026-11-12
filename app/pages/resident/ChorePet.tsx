import type { ChoreLook } from '../../data/chorePresets';
import bow from '../../../assets/Roomie Pet Bow.png';
import sprout from '../../../assets/Roomie Pet Sprout Hat.png';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import './ChorePet.css';

const scenes = {
  dishes: { action: 'washing dishes', line: 'Bubbles ready. Let’s get those dishes sparkling!', backdrop: '#edf6ff' },
  counters: { action: 'wiping counters', line: 'I brought a sponge. Let’s give the counters a quick reset!', backdrop: '#fff7e8' },
  trash: { action: 'taking out the trash', line: 'Bag packed! A quick trash run and we’re done.', backdrop: '#edf8ee' },
  floors: { action: 'sweeping the floor', line: 'Tiny broom, big plans. Let’s sweep together!', backdrop: '#f5efff' },
  laundry: { action: 'carrying laundry', line: 'Laundry basket ready. One load at a time!', backdrop: '#fff0f5' },
  plants: { action: 'watering plants', line: 'My watering can is full. Let’s give the plants a drink!', backdrop: '#f1f8e7' },
  custom: { action: 'checking the chore list', line: 'I’ve got the checklist. One little task at a time!', backdrop: '#fff7e8' },
} satisfies Record<ChoreLook, { action: string; line: string; backdrop: string }>;

export function chorePetPrompt(look: ChoreLook) { return scenes[look].line; }

function ChoreProp({ look }: { look: ChoreLook }) {
  if (look === 'floors') return <svg className="chore-pet-prop chore-pet-broom" width="38" height="61" viewBox="0 0 38 61" aria-hidden="true">
    <path d="M26 4 15 42" fill="none" stroke="#80503F" strokeWidth="5" strokeLinecap="round" />
    <path d="M26 4 15 42" fill="none" stroke="#C48363" strokeWidth="2" strokeLinecap="round" />
    <path d="m10 39 11 3 1 13-17-5z" fill="#F3BA58" stroke="#9A602A" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m9 42 12 3m-8 1-2 5m6-4-1 5" fill="none" stroke="#9A602A" strokeWidth="1.3" strokeLinecap="round" />
  </svg>;
  return <svg className="chore-pet-prop" width="38" height="43" viewBox="0 0 38 43" aria-hidden="true" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
    {look === 'dishes' && <g stroke="#4B79AB"><path d="M5 26h28c-2 9-7 13-14 13S7 35 5 26Z" fill="#A6D9F5"/><path d="M10 26a9 9 0 0 1 18 0" fill="#F8FDFF"/><circle cx="25" cy="12" r="4" fill="#CFEFFF"/><circle cx="15" cy="16" r="2.5" fill="#E7F9FF"/></g>}
    {look === 'counters' && <g stroke="#A66B2E"><rect x="5" y="24" width="28" height="13" rx="5" fill="#F9C66D"/><path d="M5 32h28"/><path d="m12 11 1.3 4 4 1.3-4 1.3-1.3 4-1.3-4-4-1.3 4-1.3zM27 10v8m-4-4h8" fill="#FFE49D"/></g>}
    {look === 'trash' && <g stroke="#53676D"><path d="m16 13-3-5h12l-3 5c8 5 12 12 12 18 0 6-5 9-15 9S4 37 4 31c0-6 4-13 12-18Z" fill="#A4B8B7"/><path d="M15 13h8m-13 16c0-3 2-6 4-8" fill="none"/></g>}
    {look === 'laundry' && <g stroke="#855574"><path d="M8 24v-6l6-4 6 4 6-4 6 4v6" fill="#E5C5F8"/><path d="M4 23h30l-4 15H8z" fill="#F1A9C5"/><path d="m12 28 1 6m6-6v6m7-6-1 6"/></g>}
    {look === 'plants' && <g stroke="#3E765B"><path d="M13 20V12h10v8m4 3c11-7 12 9 1 9M9 24l-6-5-2 3 8 9" fill="none"/><rect x="9" y="19" width="20" height="18" rx="5" fill="#8FD6AE"/><path d="M16 27h6m-3-3v6" stroke="#F7FFF7"/></g>}
    {look === 'custom' && <g stroke="#89652E"><rect x="8" y="10" width="23" height="30" rx="4" fill="#F8D998"/><rect x="14" y="7" width="11" height="6" rx="2" fill="#FFF8DF"/><path d="m12 22 2 2 4-4m2 3h6m-14 8 2 2 4-4m2 3h6" fill="none"/></g>}
  </svg>;
}

export default function ChorePet({ name, color, accessory, celebrating, look }: {
  name: string;
  color?: string;
  accessory?: string;
  celebrating: boolean;
  look?: ChoreLook;
}) {
  return <div className={`chore-pet${celebrating ? ' chore-pet--celebrating' : ''}`} style={{ backgroundColor: look ? scenes[look].backdrop : undefined }} role="img" aria-label={celebrating ? `${name} celebrating a finished chore` : look ? `${name} ${scenes[look].action}` : `${name} ready to help`}>
    <span className="chore-pet-shadow" />
    <img className="chore-pet-body" src={getHatlessPetImage(color, 'Happy')} alt="" />
    {accessory === 'Little bow' && <img className="chore-pet-bow" src={bow} alt="" />}
    {accessory === 'Leaf hat' && <img className="chore-pet-leaf" src={sprout} alt="" />}
    {look && <ChoreProp look={look} />}
    <svg className="chore-pet-sparkles" width="106" height="100" viewBox="0 0 106 100" aria-hidden="true">
      <path d="M91 17l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5zM15 13l1 3.5 3.5 1-3.5 1L15 22l-1-3.5-3.5-1 3.5-1z" fill="#C28932" />
      <circle cx="96" cy="38" r="2" fill="#DDB258" />
    </svg>
  </div>;
}
