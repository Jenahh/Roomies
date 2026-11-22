import { styles as dashboardStyles } from '../../styles/ResidentDashboard.styles';
import RoomiePet, { ROOMIE_ACCESSORY_IMAGES, ROOMIE_COLORS } from '../../components/RoomiePet';
import type { PetMood } from '../../data/roomiePetMood';
import { getPersonalChorePoints, hasUnlockedLeafHat, LEAF_HAT_POINTS } from '../../data/choreRewards';
import { useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
import { getImageSource } from '../../utils/imageSource';

const unavailableAccessories = new Set<RoomieAccessoryId>(['star-pin', 'backpack', 'bandana']);
const customizableAccessories = ROOMIE_ACCESSORY_IDS.filter(id => !unavailableAccessories.has(id));

const petColors = [
  ['Blue', ROOMIE_COLORS.blue],
  ['Green', ROOMIE_COLORS.green],
  ['Purple', ROOMIE_COLORS.purple],
  ['Yellow', ROOMIE_COLORS.yellow],
  ['Pink', ROOMIE_COLORS.pink],
] as const;

function initialAccessories(data: ResidentData): RoomieAccessoryId[] {
  const savedAccessories = getPetAccessoryIds(data.pet).filter(id => !unavailableAccessories.has(id));
  if (savedAccessories.length || data.pet?.accessories || data.pet?.accessory === 'None') return savedAccessories;
  return ['bow'];
}

export default function RoomieCustomizationScreen({ data, setData, storageError, onBack, header, sharedChores, mood }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void; header?: ReactNode; sharedChores?: boolean; mood: PetMood }) {
  const [name, setName] = useState(data.pet?.name || 'Pip');
  const [color, setColor] = useState(data.pet?.color || 'Blue');
  const [accessories, setAccessories] = useState(() => initialAccessories(data));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showLeafHatNotice, setShowLeafHatNotice] = useState(false);
  const points = getPersonalChorePoints(data, sharedChores);
  const leafUnlocked = points >= LEAF_HAT_POINTS || hasUnlockedLeafHat(data);

  function chooseAccessory(id: RoomieAccessoryId) {
    const next = togglePetAccessory(accessories, id);
    setAccessories(next);
    setError('');
    setSaved(false);
  }

  function save() {
    if (!name.trim()) { setError('Give your Roomie Pet a name.'); return; }
    if (accessories.includes('sprout-hat') && !leafUnlocked) { setError(`Complete more assigned chores to unlock the leaf hat at ${LEAF_HAT_POINTS} points.`); return; }
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

  return <View style={s.screen}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dashboardStyles.page}>{header}
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
    <View style={s.preview}>
      <View style={s.petPreview}>
        <RoomiePet mood={mood} color={color} accessories={accessories} size={220} accessibilityLabel={`${color} ${mood.toLowerCase()} Roomie Pet preview`} />
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel="Pet color" style={s.colors}>
        {petColors.map(([label, hex]) => <Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: color === label }} onPress={() => { setColor(label); setSaved(false); }} style={s.colorOption}><View style={[s.swatch, { backgroundColor: hex }, color === label && s.selected]}>{color === label && <Text style={s.check}>✓</Text>}</View></Pressable>)}
      </View>
    </View>
    <View accessibilityRole="group" accessibilityLabel="Pet accessories" style={s.accessories}>
      {customizableAccessories.map(id => {
        const equipped = accessories.includes(id);
        const locked = id === 'sprout-hat' && !leafUnlocked && !equipped;
        return <Pressable key={id} accessibilityRole={locked ? 'button' : 'checkbox'} accessibilityLabel={`${ROOMIE_ACCESSORY_LABELS[id]}${locked ? `, locked, ${LEAF_HAT_POINTS} points required` : ''}`} accessibilityState={locked ? undefined : { checked: equipped }} onPress={() => locked ? setShowLeafHatNotice(true) : chooseAccessory(id)} style={[s.accessory, equipped && s.selectedAccessory, locked && s.lockedAccessory]}>
          <Image source={getImageSource(ROOMIE_ACCESSORY_IMAGES[`../../assets/roomie-pet-kit/roomie-pet-kit/accessories/${id}.png`])} style={s.accessoryImage} resizeMode="contain" accessibilityLabel={ROOMIE_ACCESSORY_LABELS[id]} />
          {equipped && <View style={s.equippedBadge}><Text style={s.check}>✓</Text></View>}
          {locked && <View style={s.lockBadge}><Text style={s.lockText}>🔒</Text></View>}
        </Pressable>;
      })}
    </View>
    <View style={s.nameField}><TextInput accessibilityLabel="Pet name" maxLength={16} value={name} onChangeText={value => { setName(value); setSaved(false); }} style={s.nameInput} /></View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    </ScrollView><Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Changes saved' : 'Save changes'} accessibilityLiveRegion={saved ? 'polite' : 'none'} onPress={save} style={({ pressed }) => [s.save, saved && s.saved, pressed && s.pressed]}><Text style={s.saveText}>{'\u2713'}</Text></Pressable>
    <Modal visible={showLeafHatNotice} transparent animationType="fade" onRequestClose={() => setShowLeafHatNotice(false)}>
      <View style={dashboardStyles.modalBackdrop}>
        <ScrollView style={dashboardStyles.modalScroll} contentContainerStyle={dashboardStyles.modalCard}>
          <Text accessibilityRole="header" style={dashboardStyles.sectionTitle}>Leaf Hat</Text>
          <Text style={dashboardStyles.modalText}>The Leaf Hat unlocks at {LEAF_HAT_POINTS} points.</Text>
          <Pressable accessibilityRole="button" onPress={() => setShowLeafHatNotice(false)} style={dashboardStyles.closeButton}>
            <Text style={dashboardStyles.linkText}>Got it</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  </View>;
}
