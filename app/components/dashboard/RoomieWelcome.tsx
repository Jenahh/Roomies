import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import { getRoomieWelcome } from '../../data/roomieWelcome';
import RoomiePet from '../RoomiePet';

export default function RoomieWelcome({ data, setData, onFinish }: {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  onFinish: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [welcome] = useState(() => getRoomieWelcome(data, new Date()));
  const [page, setPage] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const entrance = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;
  const lines = [
    `Welcome home, ${data.name}! ${welcome.dialogue}`,
    ...welcome.updates.map(update => `You have ${update.title}: ${update.detail}.`),
    welcome.mood === 'Stressed' ? "We can do this! A little progress will help me feel better."
      : welcome.mood === 'Attention' ? "Come check in with me when you have a moment!"
        : "Let's make today a good one!",
  ].flatMap(message => {
    const pages: string[] = [];
    let current = '';
    for (const word of message.split(' ')) {
      if (current && current.length + word.length + 1 > 125) {
        pages.push(current);
        current = word;
      } else current += `${current ? ' ' : ''}${word}`;
    }
    if (current) pages.push(current);
    return pages;
  });
  const line = lines[page];
  const finished = reduceMotion || revealed >= line.length;

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);

  useEffect(() => {
    if (!open || reduceMotion) {
      entrance.setValue(1);
      float.setValue(0);
      return;
    }
    entrance.setValue(0);
    const arrive = Animated.spring(entrance, { toValue: 1, friction: 6, tension: 65, useNativeDriver: false });
    const bob = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -9, duration: 1000, useNativeDriver: false }),
      Animated.timing(float, { toValue: 0, duration: 1000, useNativeDriver: false }),
    ]));
    arrive.start();
    bob.start();
    return () => { arrive.stop(); bob.stop(); };
  }, [open, reduceMotion, entrance, float]);

  useEffect(() => {
    if (!open || reduceMotion) return;
    const timer = setInterval(() => setRevealed(count => Math.min(line.length, count + 2)), 28);
    return () => clearInterval(timer);
  }, [line, open, reduceMotion]);

  function dismiss() {
    setData(previous => ({ ...previous, welcomeSeen: {
      chores: data.chores.filter(item => !item.unassigned && (!item.assignee || item.assignee === data.name)).map(item => item.id),
      expenses: data.expenses.map(item => item.id),
    } }));
    setOpen(false);
    onFinish();
  }
  function advance() {
    if (!finished) { setRevealed(line.length); return; }
    if (page === lines.length - 1) { dismiss(); return; }
    setRevealed(0);
    setPage(current => current + 1);
  }

  return <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={dismiss}>
    <Pressable style={s.backdrop} onPress={advance} accessibilityRole="button" accessibilityLabel={`${data.pet?.name || 'Your Roomie'} says: ${line}`} accessibilityHint={finished ? page === lines.length - 1 ? 'Tap to finish' : 'Tap to continue' : 'Tap to reveal the full message'}>
      <Animated.View pointerEvents="none" style={[s.scene, { opacity: entrance, transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
        <View style={s.bubble}>
          <Text style={s.petName}>{data.pet?.name || 'Your Roomie'}</Text>
          <View>
            <Text accessible={false} style={[s.dialogue, { opacity: 0 }]}>{line}{'\u258c'}</Text>
            <Text style={[s.dialogue, s.typed]}>{finished ? line : line.slice(0, revealed)}{!finished && <Text style={s.cursor}>{'\u258c'}</Text>}</Text>
          </View>
          <Text style={s.prompt}>{finished ? page === lines.length - 1 ? 'Tap to finish' : 'Tap to continue  \u25b8' : 'Tap to reveal'}</Text>
          <View style={s.tail} />
        </View>
        <Animated.View style={{ transform: [{ translateY: float }, { rotate: float.interpolate({ inputRange: [-9, 0], outputRange: ['-2deg', '2deg'] }) }] }}>
          <RoomiePet color={data.pet?.color} mood={welcome.mood} size={180} accessibilityLabel={`${data.pet?.name || 'Your Roomie'}, feeling ${welcome.mood.toLowerCase()}`} />
        </Animated.View>
        <Animated.View style={[s.shadow, { opacity: float.interpolate({ inputRange: [-9, 0], outputRange: [0.12, 0.22] }), transform: [{ scaleX: float.interpolate({ inputRange: [-9, 0], outputRange: [0.8, 1] }) }] }]} />
      </Animated.View>
    </Pressable>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(35, 40, 62, 0.48)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  scene: { width: '100%', maxWidth: 360, alignItems: 'center', gap: 20 },
  bubble: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 3, borderColor: '#DEE5FF', padding: 20, gap: 10, shadowColor: '#202746', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  petName: { fontSize: 13, fontWeight: '700', color: '#657EEA' },
  dialogue: { fontSize: 18, lineHeight: 28, fontWeight: '500', color: '#353B50', minHeight: 84 },
  cursor: { color: '#657EEA' },
  typed: { position: 'absolute', top: 0, left: 0, right: 0 },
  prompt: { fontSize: 11, color: '#8188A1', textAlign: 'right' },
  tail: { position: 'absolute', bottom: -13, left: '47%', width: 22, height: 22, backgroundColor: '#FFFFFF', borderRightWidth: 3, borderBottomWidth: 3, borderColor: '#DEE5FF', transform: [{ rotate: '45deg' }] },
  shadow: { width: 105, height: 14, marginTop: -28, borderRadius: 60, backgroundColor: '#1B2245' },
});
