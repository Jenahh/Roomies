import ResidentAssistantConcernsScreen from './ResidentAssistantConcernsScreen';
import ResidentAssistantMessagesScreen from './ResidentAssistantMessagesScreen';
import ConcernDetailsScreen from './ConcernDetailsScreen';
import ResidentAssistantProfileScreen from './ResidentAssistantProfileScreen';
import { useResidentData } from '../../hooks/useResidentData';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Modal, SafeAreaView, ScrollView, View } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { demoConcerns, demoHall, demoHallUpdates, type ResidentConcern } from '../../data/demoResidentAssistant';
import DashboardNavigation, { type DashboardTab } from '../../components/dashboard/DashboardNavigation';
import ResidentAssistantHeader from '../../components/dashboard/ResidentAssistantHeader';
import ResidentAssistantHomeScreen from './ResidentAssistantHomeScreen';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';
import CalendarScreen from '../resident/CalendarScreen';
import { getPetMood } from '../../data/roomiePetMood';
const tabs: DashboardTab[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Concerns', icon: 'concerns' },
  { label: 'Messages', icon: 'messages' },
  { label: 'Profile', icon: 'profile' },
];

export default function ResidentAssistantDashboard({ user, onSignOut }: { user: ResidentUser; onSignOut: () => void }) {
  const { data, setData, storageError } = useResidentData(user.email, user.name);
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedConcern, setSelectedConcern] = useState<ResidentConcern | null>(null);
  const [now, setNow] = useState(() => new Date());
  const petMood = getPetMood(data, now);
  const pageScroll = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    pageScroll.current?.scrollTo({ y: 0, animated: false });
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.shell}>
        <ScrollView ref={pageScroll} contentContainerStyle={s.page}>
          <ResidentAssistantHeader />
          {activeTab === 'Home' && <ResidentAssistantHomeScreen name={data.name} hall={demoHall} now={now} concerns={demoConcerns} updates={demoHallUpdates} onAllConcerns={() => setActiveTab('Concerns')} onConcern={setSelectedConcern} />}
          {activeTab === 'Calendar' && (
            <CalendarScreen data={data} setData={setData} mood={petMood} storageError={storageError} />
          )} 
          {activeTab === 'Concerns' && <ResidentAssistantConcernsScreen hall={demoHall} concerns={demoConcerns} onSelect={setSelectedConcern} />}
          {activeTab === 'Messages' && <ResidentAssistantMessagesScreen />}
          {activeTab === 'Profile' && <ResidentAssistantProfileScreen user={user} name={data.name} hall={demoHall} color={data.pet?.color} storageError={storageError} onSaveName={name => setData(previous => ({ ...previous, name }))} onSignOut={onSignOut} />}
        </ScrollView>
        <DashboardNavigation activeTab={activeTab} onNavigate={setActiveTab} tabs={tabs} showLabels />
      </View>
      <Modal visible={!!selectedConcern} transparent animationType="fade" onRequestClose={() => setSelectedConcern(null)}>
        <View style={s.backdrop}>
          {selectedConcern && <ConcernDetailsScreen concern={selectedConcern} onBack={() => setSelectedConcern(null)} />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
