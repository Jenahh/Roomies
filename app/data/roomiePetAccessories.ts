export const ROOMIE_ACCESSORY_IDS = [
  'bow',
  'sprout-hat',
  'round-glasses',
  'beanie',
  'bucket-hat',
  'bandana',
  'bow-tie',
  'star-pin',
  'backpack',
] as const;

export type RoomieAccessoryId = typeof ROOMIE_ACCESSORY_IDS[number];
export type RoomieAccessorySlot = 'head' | 'face' | 'body' | 'pin' | 'back';

export const ROOMIE_ACCESSORY_LABELS: Record<RoomieAccessoryId, string> = {
  bow: 'Little bow',
  'sprout-hat': 'Leaf hat',
  'round-glasses': 'Round glasses',
  beanie: 'Beanie',
  'bucket-hat': 'Bucket hat',
  bandana: 'Bandana',
  'bow-tie': 'Bow tie',
  'star-pin': 'Star pin',
  backpack: 'Backpack',
};

export const ROOMIE_ACCESSORY_SLOTS: Record<RoomieAccessoryId, RoomieAccessorySlot> = {
  bow: 'head',
  'sprout-hat': 'head',
  'round-glasses': 'face',
  beanie: 'head',
  'bucket-hat': 'head',
  bandana: 'body',
  'bow-tie': 'body',
  'star-pin': 'pin',
  backpack: 'back',
};

export const ROOMIE_ACCESSORY_PLACEMENTS: Record<RoomieAccessoryId, [number, number, number, number]> = {
  backpack: [0.62254, 0.35549, 0.44034, 0.47344],
  bow: [0.55704, 0.0859, 0.23091, 0.23276],
  'sprout-hat': [0.31136, -0.07473, 0.34384, 0.33923],
  'round-glasses': [0.20172, -0.01991, 0.58952, 0.82529],
  'star-pin': [0.25802, 0.61646, 0.16711, 0.16833],
  beanie: [0.20104, -0.07148, 0.59839, 0.37167],
  'bucket-hat': [0.19378, -0.10614, 0.61441, 0.44854],
  bandana: [0.30074, 0.62527, 0.39692, 0.22621],
  'bow-tie': [0.3204, 0.5779, 0.35075, 0.30769],
};

const legacyAccessories: Record<string, RoomieAccessoryId> = {
  'Little bow': 'bow',
  'Leaf hat': 'sprout-hat',
};
const accessoryIds = new Set<string>(ROOMIE_ACCESSORY_IDS);

export function getPetAccessoryIds(pet?: { accessory?: string; accessories?: string[] } | null): RoomieAccessoryId[] {
  if (Array.isArray(pet?.accessories)) {
    return pet.accessories.filter((id): id is RoomieAccessoryId => accessoryIds.has(id));
  }
  const legacy = pet?.accessory;
  if (!legacy || legacy === 'None') return [];
  const id = legacyAccessories[legacy];
  return id ? [id] : [];
}

export function getLegacyPetAccessory(accessories: RoomieAccessoryId[]): string {
  const headAccessory = accessories.find(id => ROOMIE_ACCESSORY_SLOTS[id] === 'head');
  if (headAccessory === 'bow') return 'Little bow';
  if (headAccessory === 'sprout-hat') return 'Leaf hat';
  return 'None';
}

export function togglePetAccessory(accessories: RoomieAccessoryId[], accessory: RoomieAccessoryId): RoomieAccessoryId[] {
  if (accessories.includes(accessory)) return accessories.filter(id => id !== accessory);
  const slot = ROOMIE_ACCESSORY_SLOTS[accessory];
  return [...accessories.filter(id => ROOMIE_ACCESSORY_SLOTS[id] !== slot), accessory];
}
