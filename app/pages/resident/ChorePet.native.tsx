import { Animated, Easing, View } from 'react-native';
import { useEffect, useRef } from 'react';
import type { ChoreLook } from '../../data/chorePresets';
import { getPetAccessoryIds, type RoomieAccessoryId } from '../../data/roomiePetAccessories';
import RoomiePet from '../../components/RoomiePet';

type ChorePetProps = {
  name: string;
  color?: string;
  accessory?: string;
  accessories?: RoomieAccessoryId[];
  accessoryColors?: Partial<Record<RoomieAccessoryId, string>>;
  celebrating: boolean;
  look?: ChoreLook;
};

export default function ChorePet({ name, color, accessory, accessories, accessoryColors, celebrating }: ChorePetProps) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!celebrating) {
      bounce.setValue(0);
      return;
    }
    const animation = Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0, duration: 330, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [bounce, celebrating]);
  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={{ width: 132, height: 120, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <RoomiePet
          color={color}
          accessories={getPetAccessoryIds({ accessory, accessories })}
          accessoryColors={accessoryColors}
          size={108}
          accessibilityLabel={celebrating ? `${name} celebrating a finished chore` : `${name} ready to help`}
        />
      </Animated.View>
    </View>
  );
}
