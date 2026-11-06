import { getHouseholdResidents, replaceHouseholdResidents } from '../../data/householdResidents';
import PropertyManagerRequestsScreen from './PropertyManagerRequestsScreen';
import PropertyManagerAnnouncementsScreen from './PropertyManagerAnnouncementsScreen';
import PropertyManagerPropertiesScreen from './PropertyManagerPropertiesScreen';
import MaintenanceRequestDetailsScreen from './MaintenanceRequestDetailsScreen';
import CreateAnnouncementScreen from './CreateAnnouncementScreen';
import ManageResidentsScreen from './ManageResidentsScreen';
import { useResidentData } from '../../hooks/useResidentData';
import { useEffect, useRef, useState, type ComponentRef, type SetStateAction } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { demoManagedResidents, demoMaintenanceRequests, demoProperty, type Announcement, type MaintenanceRequest, type ManagedResident, type ManagedHousehold } from '../../data/demoPropertyManager';
import DashboardNavigation, { type DashboardTab } from '../../components/dashboard/DashboardNavigation';
import RoleDashboardHeader from '../../components/dashboard/RoleDashboardHeader';
import PropertyManagerHomeScreen from './PropertyManagerHomeScreen';
import PropertyManagerProfileScreen from './PropertyManagerProfileScreen';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

const tabs: DashboardTab[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Requests', icon: 'wrench' },
  { label: 'Announcements', icon: 'announcement' },
  { label: 'Properties', icon: 'properties' },
  { label: 'Profile', icon: 'profile' },
];

export default function PropertyManagerDashboard({ user, onSignOut }: { user: ResidentUser; onSignOut: () => void }) {
  const { data, setData, storageError } = useResidentData(user.email, user.name);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('Home');
  const [now, setNow] = useState(() => new Date());
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [residents, setResidents] = useState<ManagedResident[]>(demoManagedResidents);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [households, setHouseholds] = useState<ManagedHousehold[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pageScroll = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    pageScroll.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [activeTab]);

  const selectedHousehold = households.find(household => household.id === selectedHouseholdId);

  function openResidents(householdId?: string) {
    setSelectedHouseholdId(householdId);
    setActiveTab('ManageResidents');
  }

  function updateHouseholdResidents(update: SetStateAction<ManagedResident[]>) {
    setResidents(previous => {
      const current = getHouseholdResidents(previous, selectedHouseholdId);
      const updated = typeof update === 'function' ? update(current) : update;
      return replaceHouseholdResidents(previous, selectedHouseholdId, updated);
    });
  }

  function openAnnouncement() {
    setTitle(''); setMessage(''); setError(''); setCreatingAnnouncement(true);
  }

  function saveAnnouncement() {
    if (!title.trim() || !message.trim()) { setError('Enter a title and message.'); return; }
    setAnnouncements(previous => [{ id: crypto.randomUUID(), title: title.trim(), message: message.trim() }, ...previous]);
    setCreatingAnnouncement(false);
    setActiveTab('Announcements');
  }

  function closeModal() {
    setSelectedRequest(null); setCreatingAnnouncement(false);
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.shell}>
        <ScrollView ref={pageScroll} contentContainerStyle={s.page}>
          <RoleDashboardHeader role="Property Manager" showLogo={false} showWordmark={false} />
          {activeTab === 'Home' && <PropertyManagerHomeScreen name={data.name} now={now} property={demoProperty} requests={demoMaintenanceRequests} onCreateAnnouncement={openAnnouncement} onAllRequests={() => setActiveTab('Requests')} onRequest={setSelectedRequest} onManageResidents={() => openResidents()} />}
          {activeTab === 'Requests' && <PropertyManagerRequestsScreen property={demoProperty} requests={demoMaintenanceRequests} onSelect={setSelectedRequest} />}
          {activeTab === 'Announcements' && <PropertyManagerAnnouncementsScreen property={demoProperty} announcements={announcements} onCreate={openAnnouncement} />}
          {activeTab === 'Properties' && <PropertyManagerPropertiesScreen property={demoProperty} households={households} residents={residents} onManageHousehold={openResidents} onCreateHousehold={name => setHouseholds(previous => [...previous, { id: crypto.randomUUID(), propertyName: demoProperty.name, name }])} />}
          {activeTab === 'ManageResidents' && <ManageResidentsScreen key={selectedHouseholdId || 'property'} propertyName={demoProperty.name} household={selectedHousehold} residents={getHouseholdResidents(residents, selectedHouseholdId)} setResidents={updateHouseholdResidents} onBack={() => setActiveTab('Properties')} />}
          {activeTab === 'Profile' && <PropertyManagerProfileScreen user={user} name={data.name} propertyName={demoProperty.name} storageError={storageError} onSaveName={name => setData(previous => ({ ...previous, name }))} onSignOut={onSignOut} />}
        </ScrollView>
        <DashboardNavigation activeTab={activeTab === 'ManageResidents' ? 'Properties' : activeTab} onNavigate={setActiveTab} tabs={tabs} />
      </View>
      <Modal visible={!!selectedRequest || creatingAnnouncement} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={s.backdrop}>
          <ScrollView style={s.modal} contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={closeModal} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
            {selectedRequest && <MaintenanceRequestDetailsScreen request={selectedRequest} />}
            {creatingAnnouncement && <CreateAnnouncementScreen title={title} setTitle={setTitle} message={message} setMessage={setMessage} error={error} onSave={saveAnnouncement} />}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
