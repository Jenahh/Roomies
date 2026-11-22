import { View } from 'react-native';

export default function RoomiePetPlaceholder({ size, color, accessibilityLabel }: {
  size: number;
  color: string;
  accessibilityLabel: string;
}) {
  const eyeWidth = size * 0.12;
  const eyeHeight = size * 0.17;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ width: size, height: size, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: '82%', height: '78%', borderRadius: size * 0.36, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.08, marginTop: size * 0.08 }}>
          {[0, 1].map(eye => (
            <View key={eye} style={{ width: eyeWidth, height: eyeHeight, borderRadius: eyeWidth / 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: eyeWidth * 0.48, height: eyeHeight * 0.58, borderRadius: eyeWidth * 0.3, backgroundColor: '#353B50' }} />
            </View>
          ))}
        </View>
        <View style={{ width: size * 0.24, height: size * 0.1, borderBottomWidth: Math.max(1, size * 0.035), borderColor: '#353B50', borderRadius: size * 0.12, marginTop: size * 0.04 }} />
      </View>
    </View>
  );
}
