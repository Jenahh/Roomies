import { Text, View } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';

export default function HouseholdProgressCard({ total, completed }: { total: number; completed: number }) {
  return (
          <View style={styles.treeCard}>
            <View style={styles.treeHeading}><View style={styles.eventCopy}><Text style={styles.cardTitle}>Grow your household tree</Text><Text style={styles.progressCopy}>{total ? completed + ' of ' + total + ' chores done this week' : 'Add chores to start growing your tree'}</Text></View><Icon name="tree" color="#657EEA" size={28} /></View>
            <View accessibilityRole="progressbar" accessibilityLabel="Weekly chores" accessibilityValue={{ min: 0, max: total || 1, now: completed }} style={styles.progressTrack}><View style={[styles.progressFill, { width: (total ? completed / total * 100 : 0) + '%' }]} /></View>
            <Text style={styles.rewardText}>Complete your chores to grow together.</Text>
          </View>
  );
}
