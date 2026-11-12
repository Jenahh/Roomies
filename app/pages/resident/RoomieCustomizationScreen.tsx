import RoomiePet, { ROOMIE_COLORS } from '../../components/RoomiePet';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import {
  getLegacyPetAccessory,
  getPetAccessoryIds,
  ROOMIE_ACCESSORY_IDS,
  ROOMIE_ACCESSORY_LABELS,
  ROOMIE_ACCESSORY_SLOTS,
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
  const [selectedAccessory, setSelectedAccessory] = useState<RoomieAccessoryId | null>(() => initialAccessories(data)[0] ?? null);
  const [accessoryColors, setAccessoryColors] = useState<Partial<Record<RoomieAccessoryId, string>>>(() => data.pet?.accessoryColors || {});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const points = data.chores.filter(chore => chore.completed && (!chore.unassigned && (!chore.assignee || chore.assignee === data.name))).length * 10;
  const leafUnlocked = points >= 210;

  function chooseAccessory(id: RoomieAccessoryId) {
    const wasEquipped = accessories.includes(id);
    const next = togglePetAccessory(accessories, id);
    setAccessories(next);
    setSelectedAccessory(wasEquipped ? next[next.length - 1] ?? null : id);
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
        accessoryColors,
        lastAttention: previous.pet?.lastAttention || null,
      },
    }));
    setName(name.trim());
    setError('');
    setSaved(true);
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
    <Text accessibilityRole="header" style={s.title}>Customize Pet</Text>
    <View style={s.preview}>
      <View style={s.petPreview}>
        <RoomiePet mood="happy-3d" color={color} accessories={accessories} accessoryColors={accessoryColors} size={120} accessibilityLabel={`${color} happy Roomie Pet preview`} />
      </View>
      <Text style={s.previewLabel}>{name.trim() || 'Your pet'} · {accessories.length ? accessories.map(id => ROOMIE_ACCESSORY_LABELS[id]).join(', ') : 'No accessories'}</Text>
    </View>
    <Text style={s.label}>Choose a color</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Pet color" style={s.colors}>
      {petColors.map(([label, hex]) => <Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: color === label }} onPress={() => { setColor(label); setSaved(false); }} style={s.colorOption}><View style={[s.swatch, { backgroundColor: hex }, color === label && s.selected]}>{color === label && <Text style={s.check}>✓</Text>}</View><Text style={s.small}>{label}</Text></Pressable>)}
    </View>
    <Text style={s.label}>Accessories</Text>
    <Text style={s.hint}>Select one item per slot. Select an equipped item to set its color.</Text>
    <View accessibilityRole="group" accessibilityLabel="Pet accessories" style={s.accessories}>
      {ROOMIE_ACCESSORY_IDS.map(id => {
        const equipped = accessories.includes(id);
        const locked = id === 'sprout-hat' && !leafUnlocked && !equipped;
        return <Pressable key={id} accessibilityRole="checkbox" accessibilityLabel={`${ROOMIE_ACCESSORY_LABELS[id]}${locked ? ', locked, 210 points required' : ''}`} accessibilityState={{ checked: equipped, disabled: locked }} disabled={locked} onPress={() => chooseAccessory(id)} style={[s.accessory, equipped && s.selectedAccessory, locked && s.lockedAccessory]}>
          <Text style={s.accessoryName}>{ROOMIE_ACCESSORY_LABELS[id]}</Text>
          <Text style={s.small}>{locked ? 'Locked · 210 pts' : equipped ? `Equipped · ${ROOMIE_ACCESSORY_SLOTS[id]} slot` : 'Tap to equip'}</Text>
        </Pressable>;
      })}
    </View>
    {selectedAccessory && accessories.includes(selectedAccessory) && <>
      <Text style={s.label}>Color for {ROOMIE_ACCESSORY_LABELS[selectedAccessory]}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={`${ROOMIE_ACCESSORY_LABELS[selectedAccessory]} color`} style={s.colors}>
        {petColors.map(([label, hex]) => <Pressable key={label} accessibilityRole="radio" accessibilityLabel={`${ROOMIE_ACCESSORY_LABELS[selectedAccessory]} ${label}`} accessibilityState={{ checked: accessoryColors[selectedAccessory] === hex }} onPress={() => { setAccessoryColors(previous => ({ ...previous, [selectedAccessory]: hex })); setSaved(false); }} style={s.colorOption}><View style={[s.swatch, { backgroundColor: hex }, accessoryColors[selectedAccessory] === hex && s.selected]}>{accessoryColors[selectedAccessory] === hex && <Text style={s.check}>✓</Text>}</View><Text style={s.small}>{label}</Text></Pressable>)}
      </View>
    </>}
    <Text style={s.label}>Pet name</Text>
    <View style={s.nameField}><TextInput accessibilityLabel="Pet name" maxLength={16} value={name} onChangeText={value => { setName(value); setSaved(false); }} style={s.nameInput} /><Text style={s.small}>{name.length} / 16</Text></View>
    <View style={s.points}><Text style={s.label}>{points} personal Roomie Points</Text><Text style={s.subtitle}>Gain 10 personal Roomie Points per assigned chore completed.</Text></View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    {saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Your pet’s new look is saved.</Text>}
    <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [s.save, pressed && s.pressed]}><Text style={s.saveText}>Save changes</Text></Pressable>
  </>;
}
