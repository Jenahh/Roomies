import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { TREE_STAGES, getTreeProgress } from '../../../assets/roomie-tree-stages/roomie-tree-stages/treeStages';
import { preloadRoomieImageSources } from '../roomiePetImageLoader';
import { useRoomieAssetBundle } from '../useRoomieAssetBundle';
import { getImageSource } from '../../utils/imageSource';

export default function HouseholdProgressCard({ points }: { points: number }) {
  const { width, height } = useWindowDimensions();
  const diameter = Math.max(148, Math.min(224, width - 80, height * 0.26));
  const tree = getTreeProgress(points);
  const remainingPoints = tree.remaining;
  const bundle = useRoomieAssetBundle({ key: String(tree.stage), sources: tree.image === null ? [] : [tree.image], value: { image: tree.image, stage: tree.stage } });
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
    if (reduceMotion || tree.stage === 0) return;
    scale.setValue(0.9);
    const animation = Animated.spring(scale, { toValue: 1, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [tree.stage, bundle.ready, reduceMotion, scale]);
  const label = remainingPoints
    ? `${tree.name}, ${points} household points, ${remainingPoints} points until the next stage`
    : `${tree.name}, ${points} household points`;
  // Bounds of the visible artwork (excluding the faint transparent padding), normalized to the square PNG.
  const bounds = [
    [266, 495, 982, 1179], [261, 196, 976, 1189], [221, 55, 1023, 1209],
    [101, 69, 1152, 1216], [145, 75, 1096, 1199],
  ];
  const stageIndex = Math.max(0, (bundle.value?.stage ?? tree.stage) - 1);
  const [left, top, right, bottom] = bounds[stageIndex];
  const visibleHeight = [0.36, 0.48, 0.60, 0.70, 0.76][stageIndex] * diameter;
  const imageSize = visibleHeight * 1254 / (bottom - top);
  const imageLeft = diameter / 2 - imageSize * (left + right) / (2 * 1254);
  const imageTop = diameter / 2 - imageSize * (top + bottom) / (2 * 1254);
  const segmentCount = 32;
  const segmentLength = diameter * 0.044;
  const segmentThickness = 2.5;
  const radius = diameter / 2 - segmentThickness / 2;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(tree.progress * 100) }} style={s.container}>
    <View style={[s.circle, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}>
      <Animated.View style={{ position: 'absolute', left: imageLeft, top: imageTop, transform: [{ scale }] }}>
        {tree.stage > 0 && bundle.value?.image != null && <Image source={getImageSource(bundle.value.image)} resizeMode="contain" style={{ width: imageSize, height: imageSize }} accessible={false} />}
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
    <Text numberOfLines={1} style={s.points}>{points} household points</Text>
    {remainingPoints > 0 && <Text numberOfLines={1} style={s.nextStage}>{remainingPoints} to next stage</Text>}
  </View>;
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 14, marginBottom: 20 },
  circle: { backgroundColor: '#EAF6EF', alignItems: 'center', justifyContent: 'center' },
  points: { marginTop: 10, color: '#315F46', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  nextStage: { marginTop: 4, color: '#426858', fontSize: 14, textAlign: 'center' },
  dash: { position: 'absolute', borderRadius: 2, backgroundColor: '#C7DBCF', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#56A97D' },
});
