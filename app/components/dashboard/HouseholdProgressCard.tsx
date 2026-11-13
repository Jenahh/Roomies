import { Text, View } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';

export default function HouseholdProgressCard({ total, completed }: { total: number; completed: number }) {
  const dashCount = 5;
  const completedDashes = total ? Math.round(completed / total * dashCount) : 0;

  return (
          <View style={styles.treeCard}>
            <View style={styles.treeHeading}>
              <Text style={styles.rewardText}>Complete your chores to grow together.</Text>
              <Icon name="tree" color="#657EEA" size={28} />
            </View>
            <View accessibilityRole="progressbar" accessibilityLabel="Weekly chores" accessibilityValue={{ min: 0, max: total || 1, now: completed }} style={styles.progressTrack}>
              {Array.from({ length: dashCount }, (_, index) => <View key={index} style={[styles.progressDash, index < completedDashes && styles.progressDashComplete]} />)}
            </View>
          </View>
  );
}
