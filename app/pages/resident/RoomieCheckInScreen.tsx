import { useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import { getPetMood } from '../../data/roomiePetMood';
import Icon from '../../components/dashboard/DashboardIcon';
import { styles as s } from '../../styles/RoomieCheckInScreen.styles';

type RoomieCheckInScreenProps = {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  now: Date;
  storageError: string;
  onBack: () => void;
  onExpenses: () => void;
};

function personalPoints(data: ResidentData) {
  return data.chores.filter(chore => chore.completed && (!chore.assignee || chore.assignee === data.name)).length * 10;
}

export default function RoomieCheckInScreen({ data, setData, now, storageError, onBack, onExpenses }: RoomieCheckInScreenProps) {
  const [startingPoints] = useState(() => personalPoints(data));
  const [checkedIn, setCheckedIn] = useState(false);
  const [startingChoreIds] = useState(() => data.chores.filter(chore => !chore.completed && (!chore.assignee || chore.assignee === data.name)).map(chore => chore.id));
  const chores = data.chores.filter(chore => startingChoreIds.includes(chore.id));
  const mood = getPetMood(data, now);
  const points = personalPoints(data);
  const gained = Math.max(0, points - startingPoints);
  const name = data.pet?.name || 'Your Roomie Pet';
  const unpaid = data.expenses.filter(expense => !expense.settled);

  function giveAttention() {
    setData(previous => ({ ...previous, pet: previous.pet ? { ...previous.pet, lastAttention: new Date().toISOString() } : null }));
    setCheckedIn(true);
  }

  function completeChore(id: string) {
    setData(previous => ({
      ...previous,
      chores: previous.chores.map(chore => chore.id === id && (!chore.assignee || chore.assignee === previous.name) ? { ...chore, completed: true } : chore),
      pet: previous.pet ? { ...previous.pet, lastAttention: new Date().toISOString() } : null,
    }));
    setCheckedIn(true);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text><Text style={s.detail}>My Roomie Pet</Text></Pressable>
      <Text accessibilityRole="header" style={s.title}>{checkedIn && mood === 'Happy' ? 'A fresh start!' : 'Roomie check-in'}</Text>
      <Text style={s.subtitle}>{mood === 'Stressed' ? 'A little progress can help your pet feel better.' : mood === 'Attention' ? 'Your companion could use a little attention.' : 'Keep growing together.'}</Text>
      <View style={s.hero}><Image source={{ uri: getHatlessPetImage(data.pet?.color, mood) }} style={s.image} resizeMode="contain" accessibilityLabel={`${name}, ${mood.toLowerCase()}`} /></View>
      <View style={s.heading}><Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.sectionTitle}>{mood === 'Happy' ? `${name} is happy${checkedIn ? ' again' : ''}` : mood === 'Stressed' ? `${name} feels stressed` : `${name} needs attention`}</Text><View style={s.badge}><Text style={s.badgeText}>{mood === 'Attention' ? 'Needs attention' : mood}</Text></View></View>
      <View style={s.card}>
        {chores.map(chore => <View key={chore.id}>
          <View style={s.row}><Icon name="chores" color={chore.completed ? '#399366' : '#737783'} size={18} /><Text style={s.text}>{chore.title}{chore.completed ? ' · Completed' : ''}</Text></View>
          {!chore.completed && <Pressable accessibilityRole="button" accessibilityLabel={`Complete ${chore.title}`} onPress={() => completeChore(chore.id)} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={s.buttonText}>Mark complete</Text></Pressable>}
        </View>)}
        {!chores.some(chore => !chore.completed) && <Text style={s.detail}>All your assigned chores are caught up.</Text>}
        <Text style={s.detail}>{unpaid.length ? `${unpaid.length} shared ${unpaid.length === 1 ? 'expense needs' : 'expenses need'} settling.` : 'Shared expenses · Already settled'}</Text>
        {unpaid.length > 0 && <Pressable accessibilityRole="button" onPress={onExpenses} style={s.button}><Text style={s.buttonText}>Review expenses</Text></Pressable>}
      </View>
      {mood === 'Attention' && <Pressable accessibilityRole="button" onPress={giveAttention} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={s.buttonText}>Give attention</Text></Pressable>}
      <View style={s.points}><Text style={s.pointsTitle}>{gained ? `+${gained} Roomie Points` : `${points} Roomie Points`}</Text><Text style={s.detail}>{gained ? `${startingPoints} → ${points} personal points` : 'Earn 10 points for each assigned chore completed.'}</Text></View>
      {points >= 210 && <>
        <View style={s.unlock}><View style={s.row}><Icon name="sprout" color="#399366" size={26} /><Text style={s.text}>{startingPoints < 210 ? 'Leaf hat unlocked!' : 'Leaf hat available'}</Text></View><Text style={s.detail}>{points} / 210 points reached.</Text></View>
        <Pressable accessibilityRole="button" disabled={data.pet?.accessory === 'Leaf hat'} onPress={() => setData(previous => ({ ...previous, pet: previous.pet ? { ...previous.pet, accessory: 'Leaf hat' } : null }))} style={s.button}><Text style={s.buttonText}>{data.pet?.accessory === 'Leaf hat' ? 'Leaf hat equipped' : 'Equip leaf hat'}</Text></Pressable>
      </>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    </>
  );
}
