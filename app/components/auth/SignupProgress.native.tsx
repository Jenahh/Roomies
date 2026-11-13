import { View } from 'react-native';
import { StyleSheet } from 'react-native';

type SignupProgressProps = {
  step: 1 | 2 | 3 | 4;
};

export default function SignupProgress({ step }: SignupProgressProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Sign-up progress"
      accessibilityValue={{ min: 1, max: 4, now: step, text: `Step ${step} of 4` }}
      style={styles.track}
    >
      {[1, 2, 3, 4].map(segment => (
        <View key={segment} style={[styles.segment, segment <= step && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', width: '100%', gap: 7, marginBottom: 20 },
  segment: { flex: 1, height: 4, borderRadius: 999, backgroundColor: '#E4E3E0' },
  active: { backgroundColor: '#657EEA' },
});
