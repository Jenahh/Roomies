import RoomiePet, { ROOMIE_ACCESSORY_IMAGES, ROOMIE_COLORS } from '../../components/RoomiePet';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import {
  getLegacyPetAccessory,
  getPetAccessoryIds,
  ROOMIE_ACCESSORY_IDS,
  ROOMIE_ACCESSORY_LABELS,
  togglePetAccessory,
  type RoomieAccessoryId,
} from '../../data/roomiePetAccessories';
import { styles as s } from '../../styles/RoomieCustomizationScreen.styles';

const petColors = [
  ['Blue', ROOMIE_COLORS.blue],
  ['Green', ROOMIE_COLORS.green],
  ['Purple', ROOMIE_COLORS.purple],
  ['Yellow', ROOMIE_COLORS.yellow],
  ['Pink', ROOMIE_COLORS.pink],
] as const;

function initialAccessories(data: ResidentData): RoomieAccessoryId[] {
  const savedAccessories = getPetAccessoryIds(data.pet);
  if (savedAccessories.length || data.pet?.accessories || data.pet?.accessory === 'None') return savedAccessories;
  return ['bow'];
}

export default function RoomieCustomizationScreen({ data, setData, storageError, onBack }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void }) {
  const [name, setName] = useState(data.pet?.name || 'Pip');
  const [color, setColor] = useState(data.pet?.color || 'Blue');
  const [accessories, setAccessories] = useState(() => initialAccessories(data));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const points = data.chores.filter(chore => chore.completed && (!chore.unassigned && (!chore.assignee || chore.assignee === data.name))).length * 10;
  const leafUnlocked = points >= 210;

  function chooseAccessory(id: RoomieAccessoryId) {
    const next = togglePetAccessory(accessories, id);
    setAccessories(next);
    setError('');
    setSaved(false);
  }

  function save() {
    if (!name.trim()) { setError('Give your Roomie Pet a name.'); return; }
    if (accessories.includes('sprout-hat') && !leafUnlocked) { setError('Complete more assigned chores to unlock the leaf hat at 210 points.'); return; }
    setData(previous => ({
      ...previous,
      pet: {
        ...previous.pet,
        name: name.trim(),
        color,
        accessory: getLegacyPetAccessory(accessories),
        accessories,
        accessoryColors: {},
        lastAttention: previous.pet?.lastAttention || null,
      },
    }));
    setName(name.trim());
    setError('');
    setSaved(true);
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
    <View style={s.preview}>
      <View style={s.petPreview}>
        <RoomiePet mood="happy-3d" color={color} accessories={accessories} size={220} accessibilityLabel={`${color} happy Roomie Pet preview`} />
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel="Pet color" style={s.colors}>
        {petColors.map(([label, hex]) => <Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: color === label }} onPress={() => { setColor(label); setSaved(false); }} style={s.colorOption}><View style={[s.swatch, { backgroundColor: hex }, color === label && s.selected]}>{color === label && <Text style={s.check}>✓</Text>}</View></Pressable>)}
      </View>
    </View>
    <View accessibilityRole="group" accessibilityLabel="Pet accessories" style={s.accessories}>
      {ROOMIE_ACCESSORY_IDS.map(id => {
        const equipped = accessories.includes(id);
        const locked = id === 'sprout-hat' && !leafUnlocked && !equipped;
        return <Pressable key={id} accessibilityRole="checkbox" accessibilityLabel={`${ROOMIE_ACCESSORY_LABELS[id]}${locked ? ', locked, 210 points required' : ''}`} accessibilityState={{ checked: equipped, disabled: locked }} disabled={locked} onPress={() => chooseAccessory(id)} style={[s.accessory, equipped && s.selectedAccessory, locked && s.lockedAccessory]}>
          <Image source={{ uri: ROOMIE_ACCESSORY_IMAGES[`../../assets/roomie-pet-kit/roomie-pet-kit/accessories/${id}.png`] }} style={s.accessoryImage} resizeMode="contain" accessibilityLabel={ROOMIE_ACCESSORY_LABELS[id]} />
          {equipped && <View style={s.equippedBadge}><Text style={s.check}>✓</Text></View>}
          {locked && <View style={s.lockBadge}><Text style={s.lockText}>🔒</Text></View>}
        </Pressable>;
      })}
    </View>
    <View style={s.nameField}><TextInput accessibilityLabel="Pet name" maxLength={16} value={name} onChangeText={value => { setName(value); setSaved(false); }} style={s.nameInput} /></View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Changes saved' : 'Save changes'} accessibilityLiveRegion={saved ? 'polite' : 'none'} onPress={save} style={({ pressed }) => [s.save, saved && s.saved, pressed && s.pressed]}><Text style={s.saveText}>✓</Text></Pressable>
  </>;
}
