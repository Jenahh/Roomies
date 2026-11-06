import AchievementProgressBar from '../../components/dashboard/AchievementProgressBar';
import { Pressable, Text, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import Icon, { type IconName } from '../../components/dashboard/DashboardIcon';
import AchievementProgressCard from '../../components/dashboard/AchievementProgressCard';
import { styles as s } from '../../styles/AchievementsScreen.styles';

function weekKey(value: Date) {
  const date = new Date(value);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export default function AchievementsScreen({ data, now, onBack }: { data: ResidentData; now: Date; onBack: () => void }) {
  const personalCompleted = data.chores.filter(chore => chore.completed && (!chore.assignee || chore.assignee === data.name));
  const currentWeek = weekKey(now);
  const weeks = [2, 1, 0].map(offset => {
    const date = new Date(now);
    date.setDate(date.getDate() - offset * 7);
    const key = weekKey(date);
    const chores = data.chores.filter(chore => weekKey(new Date(chore.due + 'T12:00:00')) === key);
    const completed = chores.filter(chore => chore.completed).length;
    return { key, label: new Date(key + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), total: chores.length, completed, achieved: chores.length > 0 && completed === chores.length };
  });
  let streak = 0;
  for (const week of [...weeks].reverse()) { if (!week.achieved) break; streak++; }
  const current = weeks[2];
  const completedWeeks = [...new Set(data.chores.map(chore => weekKey(new Date(chore.due + 'T12:00:00'))))].filter(key => key <= currentWeek && data.chores.filter(chore => weekKey(new Date(chore.due + 'T12:00:00')) === key).every(chore => chore.completed)).length;
  const personalThisWeek = personalCompleted.filter(chore => weekKey(new Date(chore.due + 'T12:00:00')) === currentWeek).length;
  const badges: { title: string; detail: string; icon: IconName; unlocked: boolean }[] = [
    { title: 'Cleaning Champion', detail: '20 chores done', icon: 'star', unlocked: personalCompleted.length >= 20 },
    { title: 'Team Player', detail: 'All weekly chores done', icon: 'concerns', unlocked: current.achieved },
    { title: 'On a Roll', detail: '3 complete weeks in a row', icon: 'flame', unlocked: streak >= 3 },
  ];

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
      <View style={s.header}>
        
        <View style={s.copy}><Text accessibilityRole="header" style={s.title}>Achievements</Text></View>
        <Icon name="star" color="#657EEA" size={24} />
      </View>
      <View style={s.points}>
        <View style={s.pointsCopy}>
          <Text style={s.sectionTitle}>Roomie points</Text>
          <Text style={s.detail}>Earn 10 points for every assigned chore you complete.</Text>
          <AchievementProgressBar label="Points toward Cleaning Champion" value={personalCompleted.length * 10} target={200} />
          <Text style={s.detail}>{Math.min(personalCompleted.length * 10, 200)} / 200 pts</Text>
        </View>
        <View style={s.pill}><Text style={s.pointsText}>{personalCompleted.length * 10} pts</Text></View>
      </View>
      <View style={s.streak}>
        <Text style={s.sectionTitle}>{streak ? `${streak}-week streak` : 'Start your household streak'}</Text>
        {streak > 0 && <View style={s.weeks}>{weeks.map(week => <View key={week.key} style={s.pill}><Text style={s.weekText}>{week.achieved ? '✓ ' : ''}{week.label}</Text></View>)}</View>}
        {current.total > 0 ? <>
        <Text style={s.detail}>{current.completed} of {current.total} chores done this week</Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Weekly household chores" accessibilityValue={{ min: 0, max: current.total || 1, now: current.completed }} style={s.track}><View style={[s.fill, { width: `${current.total ? current.completed / current.total * 100 : 0}%` }]} /></View>
        </> : <Text style={s.detail}>Complete your household chores this week to start a streak.</Text>}
      </View>
      <View style={s.heading}><Text accessibilityRole="header" style={s.sectionTitle}>Upcoming badges</Text></View>
      <AchievementProgressCard title="On Fire" description="Complete 4 assigned chores in one week." icon="flame" value={personalThisWeek} target={4} amber />
      <AchievementProgressCard title="Green Thumb" description="Complete all household chores in 5 weeks." icon="sprout" value={completedWeeks} target={5} />
      <View style={s.heading}><Text accessibilityRole="header" style={s.sectionTitle}>Earned badges</Text><Text style={s.hint}>{badges.filter(badge => badge.unlocked).length} unlocked</Text></View>
      <View style={s.badges}>
        {badges.map((badge, index) => <View key={badge.title} accessibilityLabel={`${badge.title}, ${badge.unlocked ? 'unlocked' : 'locked'}`} style={[s.badge, !badge.unlocked && s.locked]}>
          <View style={[s.badgeIcon, index === 1 && s.amber, index === 2 && s.lavender]}><Icon name={badge.icon} size={23} /></View>
          <Text style={s.badgeName}>{badge.title}</Text><Text style={s.badgeDetail}>{badge.detail}</Text>
        </View>)}
      </View>
    </>
  );
}
