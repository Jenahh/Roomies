import bowImage from '../../../assets/Roomie Pet Bow.png';
import sproutHatImage from '../../../assets/Roomie Pet Sprout Hat.png';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/RoomieCustomizationScreen.styles';


const petColors = { Blue: '#7C97F5', Green: '#77CAA0', Purple: '#B69BEF', Yellow: '#F6CC76', Pink: '#EDA5BF' };

export default function RoomieCustomizationScreen({ data, setData, storageError, onBack }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void }) {
  const [name, setName] = useState(data.pet?.name || 'Pip');
  const [color, setColor] = useState(data.pet?.color || 'Blue');
  const [accessory, setAccessory] = useState(data.pet?.accessory || 'Little bow');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const points = data.chores.filter(chore => chore.completed && (!chore.assignee || chore.assignee === data.name)).length * 10;
  const leafUnlocked = points >= 210;
  function save() {
    if (!name.trim()) { setError('Give your Roomie Pet a name.'); return; }
    if (accessory === 'Leaf hat' && !leafUnlocked) { setError('Complete more assigned chores to unlock the leaf hat at 210 points.'); return; }
    setData(previous => ({ ...previous, pet: { ...previous.pet, name: name.trim(), color, accessory, lastAttention: previous.pet?.lastAttention || null } }));
    setName(name.trim()); setError(''); setSaved(true);
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
    <Text accessibilityRole="header" style={s.title}>Customize Pet</Text>
    <View style={s.preview}><View style={s.petPreview}><Image source={{ uri: getHatlessPetImage(color) }} style={s.petImage} resizeMode="contain" accessibilityLabel={`${color} Roomie Pet preview`} />{accessory !== 'None' && <Image source={{ uri: accessory === 'Little bow' ? bowImage : sproutHatImage }} style={accessory === 'Little bow' ? s.bowOverlay : s.sproutOverlay} resizeMode="contain" accessibilityLabel={accessory} />}</View><Text style={s.previewLabel}>{name.trim() || 'Your pet'} · {accessory === 'None' ? 'No accessory' : `${accessory} equipped`}</Text></View>
    <Text style={s.label}>Choose a color</Text><View accessibilityRole="radiogroup" accessibilityLabel="Pet color" style={s.colors}>{Object.entries(petColors).map(([label, hex]) => <Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: color === label }} onPress={() => { setColor(label); setSaved(false); }} style={s.colorOption}><View style={[s.swatch, { backgroundColor: hex }, color === label && s.selected]}>{color === label && <Text style={s.check}>✓</Text>}</View><Text style={s.small}>{label}</Text></Pressable>)}</View>
    <Text style={s.label}>Pet name</Text><View style={s.nameField}><TextInput accessibilityLabel="Pet name" maxLength={16} value={name} onChangeText={value => { setName(value); setSaved(false); }} style={s.nameInput} /><Text style={s.small}>{name.length} / 16</Text></View>
    <Text style={s.label}>Accessories</Text><View accessibilityRole="radiogroup" accessibilityLabel="Pet accessory" style={s.accessories}>{['None', 'Little bow', 'Leaf hat'].map(item => { const locked = item === 'Leaf hat' && !leafUnlocked; return <Pressable key={item} accessibilityRole="radio" accessibilityLabel={`${item}${locked ? ', locked, 210 points required' : ''}`} accessibilityState={{ checked: accessory === item, disabled: locked }} disabled={locked} onPress={() => { setAccessory(item); setSaved(false); }} style={[s.accessory, accessory === item && s.selectedAccessory]}>{item === 'None' ? <Text style={s.accessoryIcon}>{'\u2298'}</Text> : <img src={item === 'Little bow' ? bowImage : sproutHatImage} alt={item} width={36} height={36} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />}<Text style={s.accessoryName}>{item}</Text><Text style={s.small}>{locked ? 'Locked · 210 pts' : accessory === item ? 'Selected' : 'Unlocked'}</Text></Pressable>; })}</View>
    <View style={s.points}><Text style={s.label}>{points} personal Roomie Points</Text><Text style={s.subtitle}>Gain 10 personal Roomie Points per assigned chore completed.</Text></View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}{!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}{saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Your pet’s new look is saved.</Text>}
    <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [s.save, pressed && s.pressed]}><Text style={s.saveText}>Save changes</Text></Pressable>
  </>;
}
