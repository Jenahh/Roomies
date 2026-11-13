import { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';
import RoomiePet from '../RoomiePet';

type VerificationPetProps = {
  label: string;
  role?: 'assistant' | 'property-manager';
  mood?: 'happy' | 'annoyed' | 'stressed' | 'happy-3d' | 'annoyed-3d' | 'stressed-3d';
};

export default function VerificationPet({ label, role, mood }: VerificationPetProps) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(float, { toValue: 0, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const rotate = float.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });

  return (
    <View accessible accessibilityRole="summary" accessibilityLabel={label} style={{ alignItems: 'center', gap: 24 }}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <RoomiePet role={role} mood={mood} size={160} accessibilityLabel="Roomie" />
      </Animated.View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', gap: 10 }}>
        {[0, 1, 2].map(dot => <View key={dot} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#657EEA', opacity: dot === 0 ? 1 : 0.35 }} />)}
      </View>
    </View>
  );
}
