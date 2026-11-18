import { StyleSheet, View } from 'react-native';

export default function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <View style={styles.icon} accessible={false}>
      <View style={styles.eye}>
        <View style={styles.pupil} />
      </View>
      {!visible && <View style={styles.slash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 22, height: 18, alignItems: 'center', justifyContent: 'center' },
  eye: { width: 17, height: 11, borderWidth: 1.5, borderColor: '#666B7A', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  pupil: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#666B7A' },
  slash: { position: 'absolute', width: 22, height: 1.5, borderRadius: 1, backgroundColor: '#666B7A', transform: [{ rotate: '-45deg' }] },
});
