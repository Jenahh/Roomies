import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import RoomiePet from '../RoomiePet';
import DashboardIcon from '../dashboard/DashboardIcon';
import './ProfileSupport.css';
import { Droplets, Zap, Thermometer, Refrigerator, Wrench, Users, Volume2, Heart, MessageCircle, ChevronRight, History, Lock, Calendar } from 'lucide-react';

type SupportKind = 'maintenance' | 'ra';
type Props = {
  onMaintenance: (category: string) => void;
  onContactRA: (category: string) => void;
  onMaintenanceHistory: () => void;
  onRAHistory: () => void;
  color?: string;
};
const options = {
  maintenance: [
    { label: 'Plumbing', icon: Droplets },
    { label: 'Electrical', icon: Zap },
    { label: 'Heating & cooling', icon: Thermometer },
    { label: 'Appliances', icon: Refrigerator },
    { label: 'Doors & locks', icon: Lock },
    { label: 'General repair', icon: Wrench },
    { label: 'Other', icon: Wrench },
  ],
  ra: [
    { label: 'Roommate conflict', icon: Users },
    { label: 'Noise complaint', icon: Volume2 },
    { label: 'Personal support', icon: Heart },
    { label: 'General support', icon: MessageCircle },
    { label: 'Schedule a conversation', icon: Calendar },
    { label: 'Other', icon: MessageCircle },
  ],
};

const nativeIcons = {
  maintenance: ['dishes', 'sparkles', 'flame', 'laundry', 'home', 'wrench', 'wrench'],
  ra: ['group', 'announcement', 'concerns', 'messages', 'calendar', 'messages'],
} as const;

const native = StyleSheet.create({
  section: { marginTop: 26 },
  heading: { color: '#292B35', fontSize: 23, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#7B7D87', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', gap: 14 },
  card: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 22, paddingVertical: 20, paddingHorizontal: 10, backgroundColor: '#EDF0FF' },
  raCard: { backgroundColor: '#F2EDFF' },
  cardLabel: { color: '#292B35', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  arrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF99', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#657EEA', fontSize: 20 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: '#23263C7A' },
  popup: { width: '100%', maxWidth: 400, maxHeight: '90%', borderRadius: 26, backgroundColor: '#FAF9F6', overflow: 'hidden' },
  popupContent: { paddingHorizontal: 22, paddingTop: 42, paddingBottom: 24, gap: 8 },
  close: { position: 'absolute', top: 0, right: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  closeText: { color: '#7B7D87', fontSize: 28 },
  speech: { borderRadius: 22, backgroundColor: '#EFEBFF', padding: 16, gap: 8 },
  speechTail: { position: 'absolute', bottom: -7, alignSelf: 'center', width: 20, height: 20, backgroundColor: '#EFEBFF', transform: [{ rotate: '45deg' }] },
  speechTitle: { color: '#292B35', fontSize: 20, fontWeight: '700' },
  speechText: { color: '#292B35', fontSize: 14, lineHeight: 21 },
  mascot: { alignSelf: 'center', marginTop: 10, marginBottom: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E3E0EF', backgroundColor: '#FFFFFF' },
  optionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9EDFF' },
  optionLabel: { flex: 1, color: '#292B35', fontSize: 14, fontWeight: '500' },
  chevron: { color: '#7885D9', fontSize: 22 },
  divider: { height: 1, backgroundColor: '#E4E0ED', marginHorizontal: 4, marginTop: 8, marginBottom: 4 },
  history: { backgroundColor: '#EEEBFC', borderColor: '#E3DEF5' },
  historyIcon: { backgroundColor: '#DED9F8' },
  historyLabel: { color: '#514478', fontWeight: '600' },
  pressed: { opacity: 0.75 },
});
export default function ProfileSupport({ onMaintenance, onContactRA, onMaintenanceHistory, onRAHistory, color }: Props) {
  const [active, setActive] = useState<SupportKind | null>(null);
  const popup = useRef(new Animated.Value(0)).current;
  const mascot = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const rows = useRef(new Animated.Value(0)).current;
  const maintenancePress = useRef(new Animated.Value(1)).current;
  const raPress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === 'web' || !active) return;
    const entrance = Animated.parallel([
      Animated.timing(popup, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false }),
      Animated.timing(mascot, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false }),
      Animated.timing(rows, { toValue: 1, duration: 1090, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
      Animated.sequence([
        Animated.delay(650),
        Animated.loop(Animated.sequence([
          Animated.timing(float, { toValue: -6, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
          Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        ])),
      ]),
    ]);
    entrance.start();
    return () => {
      entrance.stop();
      popup.setValue(0);
      mascot.setValue(0);
      float.setValue(0);
      rows.setValue(0);
    };
  }, [active, float, mascot, popup, rows]);

  function animatePress(scale: Animated.Value, toValue: number) {
    Animated.spring(scale, { toValue, speed: 25, bounciness: 5, useNativeDriver: true, isInteraction: false }).start();
  }

  function openCategory(category: string) {
    setActive(null);
    if (active === 'maintenance') onMaintenance(category);
    else onContactRA(category);
  }

  function openHistory() {
    setActive(null);
    if (active === 'maintenance') onMaintenanceHistory();
    else onRAHistory();
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={native.section}>
        <Text accessibilityRole="header" style={native.heading}>Need a hand?</Text>
        <Text style={native.subtitle}>Report an issue or reach out to your RA.</Text>
        <View style={native.grid}>
          <Animated.View style={{ flex: 1, transform: [{ scale: maintenancePress }] }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Maintenance issue" onPress={() => setActive('maintenance')} onPressIn={() => animatePress(maintenancePress, 0.96)} onPressOut={() => animatePress(maintenancePress, 1)} style={native.card}>
              <RoomiePet role="property-manager" color={color} size={85} />
              <Text style={native.cardLabel}>Maintenance issue</Text>
              <View style={native.arrow}><Text style={native.arrowText}>→</Text></View>
            </Pressable>
          </Animated.View>
          <Animated.View style={{ flex: 1, transform: [{ scale: raPress }] }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Contact my RA" onPress={() => setActive('ra')} onPressIn={() => animatePress(raPress, 0.96)} onPressOut={() => animatePress(raPress, 1)} style={[native.card, native.raCard]}>
              <RoomiePet role="assistant" color={color} size={85} />
              <Text style={native.cardLabel}>Contact my RA</Text>
              <View style={native.arrow}><Text style={native.arrowText}>→</Text></View>
            </Pressable>
          </Animated.View>
        </View>
        {active && <Modal transparent animationType="fade" onRequestClose={() => setActive(null)}>
          <View style={native.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setActive(null)} accessible={false} />
            <Animated.View style={[native.popup, { transform: [{ translateY: popup.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]} accessibilityViewIsModal>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setActive(null)} style={native.close}>
                <Text style={native.closeText}>×</Text>
              </Pressable>
              <ScrollView contentContainerStyle={native.popupContent}>
                <View style={native.speech}>
                  <View style={native.speechTail} />
                  <Text accessibilityRole="header" style={native.speechTitle}>{active === 'maintenance' ? 'Let’s get that fixed!' : 'Hey, Roomie!'}</Text>
                  <Text style={native.speechText}>{active === 'maintenance' ? 'What maintenance issue would you like to report?' : 'What would you like to talk to your RA about?'}</Text>
                </View>
                <Animated.View style={[native.mascot, {
                  opacity: mascot.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0, 1, 1] }),
                  transform: [
                    { translateY: Animated.add(float, mascot.interpolate({ inputRange: [0, 0.65, 1], outputRange: [30, -8, 0] })) },
                    { scale: mascot.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.5, 1.08, 1] }) },
                  ],
                }]}><RoomiePet role={active === 'maintenance' ? 'property-manager' : 'assistant'} color={color} size={125} /></Animated.View>
                {options[active].map(({ label }, index) => {
                  const delay = 200 + index * 90;
                  const progress = rows.interpolate({ inputRange: [delay / 1090, (delay + 350) / 1090], outputRange: [0, 1], extrapolate: 'clamp' });
                  return <Animated.View key={label} style={{ opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
                    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => openCategory(label)} style={({ pressed }) => [native.option, pressed && native.pressed]}>
                      <View style={native.optionIcon}><DashboardIcon name={nativeIcons[active][index]} size={20} color="#657BE5" /></View>
                      <Text style={native.optionLabel}>{label}</Text>
                      <Text style={native.chevron}>›</Text>
                    </Pressable>
                  </Animated.View>;
                })}
                <View style={native.divider} />
                <Pressable accessibilityRole="button" onPress={openHistory} style={({ pressed }) => [native.option, native.history, pressed && native.pressed]}>
                  <View style={[native.optionIcon, native.historyIcon]}><DashboardIcon name="calendar" size={20} color="#657BE5" /></View>
                  <Text style={[native.optionLabel, native.historyLabel]}>{active === 'maintenance' ? 'Request history' : 'Message history'}</Text>
                  <Text style={native.chevron}>›</Text>
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>}
      </View>
    );
  }

  return (
    <section className="support-section">
      <h2>Need a hand?</h2>
      <p className="support-subtitle">Report an issue or reach out to your RA.</p>
      <div className="support-grid">
        <button className="support-card maintenance-card" onClick={() => setActive('maintenance')}>
          <div className="card-mascot"><RoomiePet role="property-manager" color={color} size={85} /></div>
          <span>Maintenance issue</span><span className="support-arrow">→</span>
        </button>
        <button className="support-card ra-card" onClick={() => setActive('ra')}>
          <div className="card-mascot"><RoomiePet role="assistant" color={color} size={85} /></div>
          <span>Contact my RA</span><span className="support-arrow">→</span>
        </button>
      </div>
      {active && (
        <div className="support-backdrop" onClick={() => setActive(null)}>
          <div className="support-popup" role="dialog" aria-modal="true" aria-labelledby="support-question" onClick={event => event.stopPropagation()}>
            <button className="popup-close" aria-label="Close" onClick={() => setActive(null)}>×</button>
            <div className="mascot-speech">
              <h3>{active === 'maintenance' ? 'Let’s get that fixed!' : 'Hey, Roomie!'}</h3>
              <p id="support-question">{active === 'maintenance' ? 'What maintenance issue would you like to report?' : 'What would you like to talk to your RA about?'}</p>
            </div>
            <div className="popup-mascot"><RoomiePet role={active === 'maintenance' ? 'property-manager' : 'assistant'} color={color} size={125} /></div>
            <div className="support-options">
              {options[active].map((option, index) => (
                <button key={option.label} className="support-option" style={{ animationDelay: `${200 + index * 90}ms` }} onClick={() => openCategory(option.label)}>
                  <div className="option-content"><div className="option-icon"><option.icon size={20} /></div><span className="option-label">{option.label}</span></div>
                  <ChevronRight size={18} color="#7885D9" />
                </button>
              ))}
              <div className="history-divider" />
              <button className="support-option history-option" onClick={openHistory}>
                <div className="option-content"><div className="option-icon"><History size={20} /></div><span className="option-label">{active === 'maintenance' ? 'Request history' : 'Message history'}</span></div>
                <ChevronRight size={18} color="#7885D9" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
