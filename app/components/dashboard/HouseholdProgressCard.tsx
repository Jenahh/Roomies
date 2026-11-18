import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { TREE_STAGES, getTreeProgress } from '../../../assets/roomie-tree-stages/roomie-tree-stages/treeStages';
import { preloadRoomieImageSources } from '../roomiePetImageLoader';
import { useRoomieAssetBundle } from '../useRoomieAssetBundle';
import { getImageSource } from '../../utils/imageSource';

export default function HouseholdProgressCard({ completed }: { completed: number }) {
  const { width, height } = useWindowDimensions();
  const diameter = Math.max(140, Math.min(210, width - 80, height * 0.26));
  const tree = getTreeProgress(completed);
  const bundle = useRoomieAssetBundle({ key: String(tree.stage), sources: [tree.image], value: { image: tree.image, stage: tree.stage } });
  const [reduceMotion, setReduceMotion] = useState(true);
  const scale = useRef(new Animated.Value(1)).current;
  const previousStage = useRef(tree.stage);
  useEffect(() => {
    void preloadRoomieImageSources(TREE_STAGES.map(stage => stage.image)).catch(() => {});
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  useEffect(() => {
    if (!bundle.ready || previousStage.current === tree.stage) return;
    previousStage.current = tree.stage;
    if (reduceMotion) return;
    scale.setValue(0.9);
    const animation = Animated.spring(scale, { toValue: 1, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [tree.stage, bundle.ready, reduceMotion, scale]);
  const label = tree.remaining
    ? `${tree.name} household tree, ${tree.remaining} ${tree.remaining === 1 ? 'chore' : 'chores'} until the next stage`
    : `${tree.name} household tree, flourishing, ${completed} chores completed`;
  // Bounds of the visible artwork (excluding the faint transparent padding), normalized to the square PNG.
  const bounds = [
    [266, 495, 982, 1179], [261, 196, 976, 1189], [221, 55, 1023, 1209],
    [101, 69, 1152, 1216], [145, 75, 1096, 1199],
  ];
  const stageIndex = (bundle.value?.stage ?? tree.stage) - 1;
  const [left, top, right, bottom] = bounds[stageIndex];
  const visibleHeight = [0.36, 0.48, 0.60, 0.70, 0.76][stageIndex] * diameter;
  const imageSize = visibleHeight * 1254 / (bottom - top);
  const imageLeft = diameter / 2 - imageSize * (left + right) / (2 * 1254);
  const imageTop = diameter * 0.84 - imageSize * bottom / 1254;
  const segmentCount = 32;
  const segmentLength = 12;
  const segmentThickness = 4;
  const radius = diameter / 2 - segmentThickness / 2;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(tree.progress * 100) }} style={s.container}>
    <View style={[s.circle, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}>
      <Animated.View style={{ position: 'absolute', left: imageLeft, top: imageTop, transform: [{ scale }] }}>
        {bundle.value ? <Image source={getImageSource(bundle.value.image)} resizeMode="contain" style={{ width: imageSize, height: imageSize }} accessible={false} /> : <View style={{ width: imageSize, height: imageSize }} />}
      </Animated.View>
      {Array.from({ length: segmentCount }, (_, index) => {
        const angle = index * 2 * Math.PI / segmentCount;
        const fill = Math.max(0, Math.min(1, tree.progress * segmentCount - index));
        return <View key={index} style={[s.dash, {
          width: segmentLength, height: segmentThickness,
          left: diameter / 2 + radius * Math.sin(angle) - segmentLength / 2,
          top: diameter / 2 - radius * Math.cos(angle) - segmentThickness / 2,
          transform: [{ rotate: `${index * 360 / segmentCount}deg` }],
        }]}><View style={[s.fill, { width: `${fill * 100}%` }]} /></View>;
      })}
    </View>
  </View>;
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 16, marginBottom: 14 },
  circle: { backgroundColor: '#EAF6EF', alignItems: 'center', justifyContent: 'center' },
  dash: { position: 'absolute', borderRadius: 2, backgroundColor: '#C9DED1', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#6CCD9A' },
});
