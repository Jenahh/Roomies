import { useState, type Dispatch, type SetStateAction } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import RoomiePet from '../../components/RoomiePet';
import { getPetAccessoryIds, togglePetAccessory } from '../../data/roomiePetAccessories';
import { getPersonalChorePoints, hasUnlockedLeafHat, isPersonalChore, LEAF_HAT_POINTS } from '../../data/choreRewards';
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
  sharedChores?: boolean;
  onCompleteChore: (id: string) => void;
};

export default function RoomieCheckInScreen({ data, setData, now, storageError, onBack, onExpenses, sharedChores, onCompleteChore }: RoomieCheckInScreenProps) {
  const [startingPoints] = useState(() => getPersonalChorePoints(data, sharedChores));
  const [checkedIn, setCheckedIn] = useState(false);
  const [startingChoreIds] = useState(() => data.chores.filter(chore => !chore.completed && isPersonalChore(chore, data.name, sharedChores)).map(chore => chore.id));
  const chores = data.chores.filter(chore => startingChoreIds.includes(chore.id));
  const mood = getPetMood(data, now);
  const points = getPersonalChorePoints(data, sharedChores);
  const gained = Math.max(0, points - startingPoints);
  const name = data.pet?.name || 'Your Roomie Pet';
  const unpaid = data.expenses.filter(expense => !expense.settled);

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text><Text style={s.detail}>My Roomie Pet</Text></Pressable>
      <Text accessibilityRole="header" style={s.title}>{checkedIn && mood === 'Happy' ? 'A fresh start!' : 'Roomie check-in'}</Text>
      <Text style={s.subtitle}>{mood === 'Stressed' ? 'A little progress can help your pet feel better.' : mood === 'Annoyed' ? 'Your Roomie noticed overdue chores.' : 'Keep growing together.'}</Text>
      <View style={s.hero}><RoomiePet color={data.pet?.color} mood={mood} accessories={getPetAccessoryIds(data.pet)} accessoryColors={data.pet?.accessoryColors} size={145} accessibilityLabel={`${name}, ${mood.toLowerCase()}`} /></View>
      <View style={s.heading}><Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.sectionTitle}>{mood === 'Happy' ? `${name} is happy${checkedIn ? ' again' : ''}` : mood === 'Stressed' ? `${name} feels stressed` : `${name} feels annoyed`}</Text><View style={s.badge}><Text style={s.badgeText}>{mood}</Text></View></View>
      <View style={s.card}>
        {chores.map(chore => <View key={chore.id}>
          <View style={s.row}><Icon name="chores" color={chore.completed ? '#399366' : '#737783'} size={18} /><Text style={s.text}>{chore.title}{chore.completed ? ' · Completed' : ''}</Text></View>
          {!chore.completed && <Pressable accessibilityRole="button" accessibilityLabel={`Complete ${chore.title}`} onPress={() => { onCompleteChore(chore.id); setCheckedIn(true); }} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={s.buttonText}>Mark complete</Text></Pressable>}
        </View>)}
        {!chores.some(chore => !chore.completed) && <Text style={s.detail}>All your assigned chores are caught up.</Text>}
        <Text style={s.detail}>{unpaid.length ? `${unpaid.length} shared ${unpaid.length === 1 ? 'expense needs' : 'expenses need'} settling.` : 'Shared expenses · Already settled'}</Text>
        {unpaid.length > 0 && <Pressable accessibilityRole="button" onPress={onExpenses} style={s.button}><Text style={s.buttonText}>Review expenses</Text></Pressable>}
      </View>
      <View style={s.points}><Text style={s.pointsTitle}>{gained ? `+${gained} Roomie Points` : `${points} Roomie Points`}</Text><Text style={s.detail}>{gained ? `${startingPoints} → ${points} personal points` : 'Earn 10 points for each assigned chore completed.'}</Text></View>
      {(points >= LEAF_HAT_POINTS || hasUnlockedLeafHat(data)) && <>
        <View style={s.unlock}><View style={s.row}><Icon name="sprout" color="#399366" size={26} /><Text style={s.text}>Leaf hat available</Text></View><Text style={s.detail}>Unlocked at {LEAF_HAT_POINTS} personal points.</Text></View>
        <Pressable accessibilityRole="button" disabled={getPetAccessoryIds(data.pet).includes('sprout-hat')} onPress={() => setData(previous => ({ ...previous, pet: previous.pet ? { ...previous.pet, accessory: 'Leaf hat', accessories: togglePetAccessory(getPetAccessoryIds(previous.pet), 'sprout-hat') } : null }))} style={s.button}><Text style={s.buttonText}>{getPetAccessoryIds(data.pet).includes('sprout-hat') ? 'Leaf hat equipped' : 'Equip leaf hat'}</Text></Pressable>
      </>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    </>
  );
}
