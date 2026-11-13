import type { CSSProperties } from 'react';
import type { PetMood } from '../data/roomiePetMood';
import { ROOMIE_ACTIONS, type RoomieActionId } from '../data/roomieActions';
import {
  ROOMIE_ACCESSORY_PLACEMENTS,
  ROOMIE_ACCESSORY_SLOTS,
  type RoomieAccessoryId,
  type RoomieAccessorySlot,
} from '../data/roomiePetAccessories';
import annoyed3dBody from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/annoyed-3d-body.png';
import annoyed3dDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/annoyed-3d-details.png';
import happy3dBody from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/happy-3d-body.png';
import happy3dDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/happy-3d-details.png';
import stressed3dBody from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/stressed-3d-body.png';
import stressed3dDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/assets/stressed-3d-details.png';
import propertyManager3dBody from '../../assets/roomie-role-avatars/roomie-role-avatars/property-manager-3d-body.png';
import propertyManager3dDetails from '../../assets/roomie-role-avatars/roomie-role-avatars/property-manager-3d-details.png';
import ra3dBody from '../../assets/roomie-role-avatars/roomie-role-avatars/ra-3d-body.png';
import ra3dDetails from '../../assets/roomie-role-avatars/roomie-role-avatars/ra-3d-details.png';
import broomBody from '../../assets/roomie-held-props/roomie-held-props/assets/broom-mood-body.png';
import broomDetails from '../../assets/roomie-held-props/roomie-held-props/assets/broom-mood-details.png';
import broomFaceAnnoyed from '../../assets/roomie-held-props/roomie-held-props/assets/broom-face-annoyed.png';
import broomFaceHappy from '../../assets/roomie-held-props/roomie-held-props/assets/broom-face-happy.png';
import broomFaceStressed from '../../assets/roomie-held-props/roomie-held-props/assets/broom-face-stressed.png';
import calendarBody from '../../assets/roomie-held-props/roomie-held-props/assets/calendar-mood-body.png';
import calendarDetails from '../../assets/roomie-held-props/roomie-held-props/assets/calendar-mood-details.png';
import calendarFaceAnnoyed from '../../assets/roomie-held-props/roomie-held-props/assets/calendar-face-annoyed.png';
import calendarFaceHappy from '../../assets/roomie-held-props/roomie-held-props/assets/calendar-face-happy.png';
import calendarFaceStressed from '../../assets/roomie-held-props/roomie-held-props/assets/calendar-face-stressed.png';
import foodBody from '../../assets/roomie-held-props/roomie-held-props/assets/food-mood-body.png';
import foodDetails from '../../assets/roomie-held-props/roomie-held-props/assets/food-mood-details.png';
import foodFaceAnnoyed from '../../assets/roomie-held-props/roomie-held-props/assets/food-face-annoyed.png';
import foodFaceHappy from '../../assets/roomie-held-props/roomie-held-props/assets/food-face-happy.png';
import foodFaceStressed from '../../assets/roomie-held-props/roomie-held-props/assets/food-face-stressed.png';
import receiptBody from '../../assets/roomie-held-props/roomie-held-props/assets/receipt-mood-body.png';
import receiptDetails from '../../assets/roomie-held-props/roomie-held-props/assets/receipt-mood-details.png';
import receiptFaceAnnoyed from '../../assets/roomie-held-props/roomie-held-props/assets/receipt-face-annoyed.png';
import receiptFaceHappy from '../../assets/roomie-held-props/roomie-held-props/assets/receipt-face-happy.png';
import receiptFaceStressed from '../../assets/roomie-held-props/roomie-held-props/assets/receipt-face-stressed.png';

export const ROOMIE_COLORS = {
  blue: '#6A83E6',
  purple: '#AF98EB',
  pink: '#EF9DB9',
  green: '#79C9A0',
  yellow: '#F5CA75',
};

type SpriteMood = 'happy' | 'annoyed' | 'stressed' | 'happy-3d' | 'annoyed-3d' | 'stressed-3d';
type RoomieRole = 'assistant' | 'property-manager';
type ActionMood = 'happy' | 'annoyed' | 'stressed';

const sprites: Record<SpriteMood | RoomieRole, { body: string; details: string }> = {
  happy: { body: happy3dBody, details: happy3dDetails },
  annoyed: { body: annoyed3dBody, details: annoyed3dDetails },
  stressed: { body: stressed3dBody, details: stressed3dDetails },
  'happy-3d': { body: happy3dBody, details: happy3dDetails },
  'annoyed-3d': { body: annoyed3dBody, details: annoyed3dDetails },
  'stressed-3d': { body: stressed3dBody, details: stressed3dDetails },
  assistant: { body: ra3dBody, details: ra3dDetails },
  'property-manager': { body: propertyManager3dBody, details: propertyManager3dDetails },
};
const actionSprites: Record<RoomieActionId, { body: string; details: string; faces: Record<ActionMood, string> }> = {
  chores: { body: broomBody, details: broomDetails, faces: { happy: broomFaceHappy, annoyed: broomFaceAnnoyed, stressed: broomFaceStressed } },
  expenses: { body: receiptBody, details: receiptDetails, faces: { happy: receiptFaceHappy, annoyed: receiptFaceAnnoyed, stressed: receiptFaceStressed } },
  dinner: { body: foodBody, details: foodDetails, faces: { happy: foodFaceHappy, annoyed: foodFaceAnnoyed, stressed: foodFaceStressed } },
  calendar: { body: calendarBody, details: calendarDetails, faces: { happy: calendarFaceHappy, annoyed: calendarFaceAnnoyed, stressed: calendarFaceStressed } },
};

export const ROOMIE_ACCESSORY_IMAGES = import.meta.glob('../../assets/roomie-pet-kit/roomie-pet-kit/accessories/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const accessoryLayerImages = import.meta.glob('../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function getSpriteMood(mood: PetMood | SpriteMood): SpriteMood {
  if (mood === 'Happy') return 'happy-3d';
  if (mood === 'Attention') return 'annoyed-3d';
  if (mood === 'Stressed') return 'stressed-3d';
  if (mood === 'happy') return 'happy-3d';
  if (mood === 'annoyed') return 'annoyed-3d';
  if (mood === 'stressed') return 'stressed-3d';
  return mood;
}

function getActionMood(mood: PetMood | SpriteMood): ActionMood {
  const spriteMood = getSpriteMood(mood);
  if (spriteMood === 'annoyed-3d') return 'annoyed';
  if (spriteMood === 'stressed-3d') return 'stressed';
  return 'happy';
}

function getRoomieColor(color?: string): string {
  const normalized = color?.toLowerCase();
  return Object.entries(ROOMIE_COLORS).find(([key]) => key === normalized)?.[1] ?? ROOMIE_COLORS.blue;
}

type RoomiePetProps = {
  mood?: PetMood | SpriteMood;
  color?: string;
  accessories?: RoomieAccessoryId[];
  accessoryColors?: Partial<Record<RoomieAccessoryId, string>>;
  size?: number;
  accessibilityLabel?: string;
  className?: string;
  role?: RoomieRole;
  action?: RoomieActionId;
};

export default function RoomiePet({ mood = 'happy', color, accessories = [], accessoryColors = {}, size = 128, accessibilityLabel, className, role, action }: RoomiePetProps) {
  const spriteMood = getSpriteMood(mood);
  const sprite = action ? actionSprites[action] : sprites[role ?? spriteMood];
  const actionFace = action ? actionSprites[action].faces[getActionMood(mood)] : undefined;
  const dimensions: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };
  const equippedBySlot = new Map<RoomieAccessorySlot, RoomieAccessoryId>();
  for (const id of accessories) equippedBySlot.set(ROOMIE_ACCESSORY_SLOTS[id], id);
  const selectedAccessories = [...equippedBySlot.values()];

  function renderAccessory(id: RoomieAccessoryId) {
    const [left, top, width, height] = ROOMIE_ACCESSORY_PLACEMENTS[id].map(value => value * size);
    const original = ROOMIE_ACCESSORY_IMAGES[`../../assets/roomie-pet-kit/roomie-pet-kit/accessories/${id}.png`];
    const base = accessoryLayerImages[`../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/${id}-base.png`];
    const details = accessoryLayerImages[`../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/${id}-details.png`];
    const accessoryColor = accessoryColors[id];
    const glassesOffset = id === 'round-glasses' && spriteMood !== 'happy-3d' ? size * 0.06 : 0;
    const bodyOffset = ROOMIE_ACCESSORY_SLOTS[id] === 'body' && spriteMood === 'stressed-3d' ? size * 0.03 : 0;
    const position: CSSProperties = { position: 'absolute', left, top: top + glassesOffset + bodyOffset, width, height };

    if (!accessoryColor) {
      return <img key={id} src={original} alt="" aria-hidden="true" draggable={false} style={{ ...position, objectFit: 'fill' }} />;
    }

    const tintStyle: CSSProperties = {
      ...dimensions,
      backgroundColor: accessoryColor,
      maskImage: `url("${base}")`,
      maskSize: '100% 100%',
      maskRepeat: 'no-repeat',
      WebkitMaskImage: `url("${base}")`,
      WebkitMaskSize: '100% 100%',
      WebkitMaskRepeat: 'no-repeat',
    };
    const shadingStyle: CSSProperties = { ...dimensions, objectFit: 'fill', mixBlendMode: 'multiply' };
    return (
      <div key={id} aria-hidden="true" style={{ ...position, isolation: 'isolate' }}>
        <div style={tintStyle} />
        <img src={base} alt="" draggable={false} style={shadingStyle} />
        <img src={details} alt="" draggable={false} style={{ ...dimensions, objectFit: 'fill' }} />
      </div>
    );
  }

  const bodyStyle: CSSProperties = {
    ...dimensions,
    backgroundColor: getRoomieColor(color),
    maskImage: `url("${sprite.body}")`,
    maskSize: 'contain',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskImage: `url("${sprite.body}")`,
    WebkitMaskSize: 'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
  };
  const detailsStyle: CSSProperties = { ...dimensions, objectFit: 'contain' };

  return (
    <div
      role="img"
      aria-label={accessibilityLabel ?? (action ? `Roomie ${ROOMIE_ACTIONS[action].label.toLowerCase()}` : role === 'assistant' ? 'Resident Assistant Roomie' : role === 'property-manager' ? 'Property Manager Roomie' : `Roomie Pet, ${spriteMood.replace('-3d', '')}`)}
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      {!role && !action && selectedAccessories.filter(id => ROOMIE_ACCESSORY_SLOTS[id] === 'back').map(renderAccessory)}
      <div aria-hidden="true" style={bodyStyle} />
      <img src={sprite.details} alt="" aria-hidden="true" draggable={false} style={detailsStyle} />
      {actionFace && <img src={actionFace} alt="" aria-hidden="true" draggable={false} style={detailsStyle} />}
      {!role && !action && selectedAccessories.filter(id => ROOMIE_ACCESSORY_SLOTS[id] !== 'back').map(renderAccessory)}
    </div>
  );
}
