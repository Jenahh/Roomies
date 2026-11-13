import { Image, View } from 'react-native';
import { getImageSource } from '../utils/imageSource';
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
import starPin from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/star-pin.png';
import beanie from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/beanie.png';
import sproutHat from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/sprout-hat.png';
import bandana from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bandana.png';
import bow from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bow.png';
import roundGlasses from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/round-glasses.png';
import bowTie from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bow-tie.png';
import backpack from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/backpack.png';
import bucketHat from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bucket-hat.png';
import starPinBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/star-pin-base.png';
import starPinDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/star-pin-details.png';
import sproutHatBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/sprout-hat-base.png';
import sproutHatDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/sprout-hat-details.png';
import roundGlassesBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/round-glasses-base.png';
import roundGlassesDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/round-glasses-details.png';
import bucketHatBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bucket-hat-base.png';
import bucketHatDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bucket-hat-details.png';
import bowTieBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bow-tie-base.png';
import bowTieDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bow-tie-details.png';
import bowBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bow-base.png';
import bowDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bow-details.png';
import beanieBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/beanie-base.png';
import beanieDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/beanie-details.png';
import bandanaBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bandana-base.png';
import bandanaDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/bandana-details.png';
import backpackBase from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/backpack-base.png';
import backpackDetails from '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/layers/backpack-details.png';

export const ROOMIE_COLORS = {
  blue: '#6A83E6',
  purple: '#AF98EB',
  pink: '#EF9DB9',
  green: '#79C9A0',
  yellow: '#F5CA75',
};

const spriteAssets = {
  happy: [happy3dBody, happy3dDetails],
  annoyed: [annoyed3dBody, annoyed3dDetails],
  stressed: [stressed3dBody, stressed3dDetails],
  assistant: [ra3dBody, ra3dDetails],
  'property-manager': [propertyManager3dBody, propertyManager3dDetails],
} as const;
const actionAssets = {
  chores: [broomBody, broomDetails, [broomFaceHappy, broomFaceAnnoyed, broomFaceStressed]],
  expenses: [receiptBody, receiptDetails, [receiptFaceHappy, receiptFaceAnnoyed, receiptFaceStressed]],
  dinner: [foodBody, foodDetails, [foodFaceHappy, foodFaceAnnoyed, foodFaceStressed]],
  calendar: [calendarBody, calendarDetails, [calendarFaceHappy, calendarFaceAnnoyed, calendarFaceStressed]],
} as const;
const accessoryAssets = {
  'star-pin': [starPin, starPinBase, starPinDetails],
  beanie: [beanie, beanieBase, beanieDetails],
  'sprout-hat': [sproutHat, sproutHatBase, sproutHatDetails],
  bandana: [bandana, bandanaBase, bandanaDetails],
  bow: [bow, bowBase, bowDetails],
  'round-glasses': [roundGlasses, roundGlassesBase, roundGlassesDetails],
  'bow-tie': [bowTie, bowTieBase, bowTieDetails],
  backpack: [backpack, backpackBase, backpackDetails],
  'bucket-hat': [bucketHat, bucketHatBase, bucketHatDetails],
} satisfies Record<RoomieAccessoryId, readonly [string, string | null, string | null]>;

export const ROOMIE_ACCESSORY_IMAGES: Record<string, string | number> = {
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/star-pin.png': starPin,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/beanie.png': beanie,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/sprout-hat.png': sproutHat,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bandana.png': bandana,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bow.png': bow,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/round-glasses.png': roundGlasses,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bow-tie.png': bowTie,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/backpack.png': backpack,
  '../../assets/roomie-pet-kit/roomie-pet-kit/accessories/bucket-hat.png': bucketHat,
};

type SpriteMood = 'happy' | 'annoyed' | 'stressed' | 'happy-3d' | 'annoyed-3d' | 'stressed-3d';
type RoomieRole = 'assistant' | 'property-manager';
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

const defaultColor = ROOMIE_COLORS.blue;
const accessoryLayer = { position: 'absolute' as const, width: '100%' as const, height: '100%' as const };

function normalizeMood(mood: PetMood | SpriteMood): 'happy' | 'annoyed' | 'stressed' {
  if (mood === 'Attention' || mood === 'annoyed' || mood === 'annoyed-3d') return 'annoyed';
  if (mood === 'Stressed' || mood === 'stressed' || mood === 'stressed-3d') return 'stressed';
  return 'happy';
}

export default function RoomiePet({ mood = 'happy', color, accessories = [], accessoryColors = {}, size = 128, accessibilityLabel, role, action }: RoomiePetProps) {
  const expression = normalizeMood(mood);
  const [body, details] = action ? actionAssets[action] : spriteAssets[role ?? expression];
  const face = action ? actionAssets[action][2][expression === 'happy' ? 0 : expression === 'annoyed' ? 1 : 2] : null;
  const equippedBySlot = new Map<RoomieAccessorySlot, RoomieAccessoryId>();
  accessories.forEach(id => equippedBySlot.set(ROOMIE_ACCESSORY_SLOTS[id], id));
  const selectedAccessories = [...equippedBySlot.values()];

  function renderAccessory(id: RoomieAccessoryId) {
    const [original, base, extra] = accessoryAssets[id];
    const [left, top, width, height] = ROOMIE_ACCESSORY_PLACEMENTS[id].map(value => value * size);
    const accessoryColor = accessoryColors[id];
    const glassesOffset = id === 'round-glasses' && expression !== 'happy' ? size * 0.06 : 0;
    const bodyOffset = ROOMIE_ACCESSORY_SLOTS[id] === 'body' && expression === 'stressed' ? size * 0.03 : 0;
    return (
      <View key={id} pointerEvents="none" style={{ position: 'absolute', left, top: top + glassesOffset + bodyOffset, width, height }}>
        <Image source={getImageSource(accessoryColor && base ? base : original)} resizeMode="stretch" style={{ width: '100%', height: '100%', tintColor: accessoryColor && base ? accessoryColor : undefined }} />
        {accessoryColor && extra && <Image source={getImageSource(extra)} resizeMode="stretch" style={accessoryLayer} />}
      </View>
    );
  }

  const colorKey = color?.toLowerCase() as keyof typeof ROOMIE_COLORS | undefined;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? (action ? `Roomie ${ROOMIE_ACTIONS[action].label.toLowerCase()}` : role === 'assistant' ? 'Resident Assistant Roomie' : role === 'property-manager' ? 'Property Manager Roomie' : `Roomie Pet, ${expression}`)}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      {!role && !action && selectedAccessories.filter(id => ROOMIE_ACCESSORY_SLOTS[id] === 'back').map(renderAccessory)}
      <Image source={getImageSource(body)} resizeMode="contain" style={{ width: '100%', height: '100%', tintColor: colorKey ? ROOMIE_COLORS[colorKey] : defaultColor }} />
      <Image source={getImageSource(details)} resizeMode="contain" style={accessoryLayer} />
      {face && <Image source={getImageSource(face)} resizeMode="contain" style={accessoryLayer} />}
      {!role && !action && selectedAccessories.filter(id => ROOMIE_ACCESSORY_SLOTS[id] !== 'back').map(renderAccessory)}
    </View>
  );
}
