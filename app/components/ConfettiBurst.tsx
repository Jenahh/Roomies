import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const pieces = [
  { dx: -19, dy: -12, color: '#A35FEC' },
  { dx: -8, dy: -23, color: '#D28B25' },
  { dx: 10, dy: -24, color: '#3B9663' },
  { dx: 23, dy: -10, color: '#DF6598' },
  { dx: 19, dy: 12, color: '#D28B25' },
  { dx: -16, dy: 14, color: '#3B9663' },
];

export default function ConfettiBurst({ spread = 1, duration = 460, pieceSize = 5, start = true }: {
  spread?: number;
  duration?: number;
  pieceSize?: number;
  start?: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!start) return;
    const animation = Animated.timing(progress, { toValue: 1, duration, easing: Easing.out(Easing.ease), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [duration, progress, start]);
  if (!start) return null;

  const opacity = progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '75deg'] });

  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.burst]}>
    {pieces.map(({ dx, dy, color }) => <Animated.View key={dx} style={[
      styles.piece,
      { width: pieceSize, height: pieceSize + 1, backgroundColor: color, opacity, transform: [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx * spread] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy * spread] }) },
        { scale },
        { rotate },
      ] },
    ]} />)}
  </View>;
}

const styles = StyleSheet.create({
  burst: { zIndex: 1 },
  piece: { position: 'absolute', left: '50%', top: '50%', borderRadius: 2 },
});
