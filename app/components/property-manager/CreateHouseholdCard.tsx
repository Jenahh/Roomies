import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import DashboardIcon from '../dashboard/DashboardIcon';
import { styles as s } from '../../styles/CreateHouseholdCard.styles';

type CreateHouseholdCardProps = {
  existingNames: string[];
  onCreate: (name: string) => void;
};

export default function CreateHouseholdCard({ existingNames, onCreate }: CreateHouseholdCardProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function create() {
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Enter a household name.'); return; }
    if (existingNames.some(existing => existing.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A household with this name already exists in this property.'); return;
    }
    onCreate(trimmedName);
    setName(''); setError(''); setMessage(`${trimmedName} was created.`);
  }

  return (
    <View style={s.card}>
      <View style={s.heading}><View style={s.plus}><DashboardIcon name="add" size={15} color="#657EEA" /></View><Text accessibilityRole="header" style={s.title}>Create a household</Text></View>
      <Text style={s.description}>Create a household for your residents.</Text>
      <Text style={s.label}>Household name</Text>
      <TextInput accessibilityLabel="Household name" value={name} onChangeText={value => { setName(value); setError(''); setMessage(''); }} placeholder="The Cozy Corner" placeholderTextColor="#7B7D87" maxLength={80} onSubmitEditing={create} style={s.input} />
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!message && <Text accessibilityLiveRegion="polite" style={s.success}>{message}</Text>}
      <Pressable accessibilityRole="button" onPress={create} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={s.buttonText}>Create Household</Text></Pressable>
    </View>
  );
}
