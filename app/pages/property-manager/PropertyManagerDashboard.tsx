import { randomUUID } from '../../utils/randomUUID';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatabaseRequests from '../../components/dashboard/DatabaseRequests';
import { loadAnnouncements, saveAnnouncements } from '../../data/householdAnnouncements';

import {
  getHouseholdResidents,
  replaceHouseholdResidents,
} from '../../data/householdResidents';


import PropertyManagerRequestsScreen from './PropertyManagerRequestsScreen';
import PropertyManagerAnnouncementsScreen from './PropertyManagerAnnouncementsScreen';
import PropertyManagerPropertiesScreen from './PropertyManagerPropertiesScreen';
import MaintenanceRequestDetailsScreen from './MaintenanceRequestDetailsScreen';
import CreateAnnouncementScreen from './CreateAnnouncementScreen';
import ManageResidentsScreen from './ManageResidentsScreen';

import { useResidentData } from '../../hooks/useResidentData';

import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type SetStateAction,
} from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';


import type { ResidentUser } from '../../data/demoAccount';

import {
  demoManagedResidents,
  demoProperty,
  type Announcement,
  type MaintenanceRequest,
  type ManagedResident,
  type ManagedHousehold,
} from '../../data/demoPropertyManager';

import {
  getSupportRequests,
  type SupportRequestResponse,
  type MaintenanceStatus,
} from '../../services/api';

import DashboardNavigation, {
  type DashboardTab,
} from '../../components/dashboard/DashboardNavigation';

import RoleDashboardHeader from '../../components/dashboard/RoleDashboardHeader';
import PropertyManagerHomeScreen from './PropertyManagerHomeScreen';
import PropertyManagerProfileScreen from './PropertyManagerProfileScreen';

import {
  styles as s,
} from '../../styles/PropertyManagerDashboard.styles';



const tabs: DashboardTab[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Requests', icon: 'wrench' },
  { label: 'Announcements', icon: 'announcement' },
  { label: 'Properties', icon: 'properties' },
  { label: 'Profile', icon: 'profile' },
];


// Convert backend requests to the format used
// by the existing property manager components.

function formatMaintenanceRequest(
  request: SupportRequestResponse
): MaintenanceRequest {

  const statusMap: Record<
    string,
    MaintenanceRequest['status']
  > = {
    submitted: 'Submitted',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const status = statusMap[request.status];

  if (!status) {
    throw new Error('Unknown maintenance request status.');
  }

  return {
    id: `M-${request.id}`,
    backendId: request.id,

    senderId: request.sender_id,
    senderName: request.sender_name || undefined,

    title: request.subject,

    unit: request.household_name || 'Unit unavailable',

    detail: request.category,
    category: request.category,

    description: request.description,
    photo: request.photo,

    createdAt: request.created_at,

    status,
  };
}


export default function PropertyManagerDashboard({
  user,
  onSignOut,
}: {
  user: ResidentUser;
  onSignOut: () => void;
}) {

  const { data, setData, storageError } =
    useResidentData(user.email, user.name);

  const [selectedHouseholdId, setSelectedHouseholdId] =
    useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState(user.databaseDemoStaff ? 'Requests' : 'Home');

  const [now, setNow] = useState(() => new Date());

  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);

  const [residents, setResidents] =
    useState<ManagedResident[]>(demoManagedResidents);

  const [creatingAnnouncement, setCreatingAnnouncement] =
    useState(false);

  const [households, setHouseholds] =
    useState<ManagedHousehold[]>([]);

  const [announcements, setAnnouncements] =
    useState<Announcement[]>(loadAnnouncements);


  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const pageScroll =
    useRef<ComponentRef<typeof ScrollView>>(null);


  // Backend maintenance request state.

  const [maintenanceRequests, setMaintenanceRequests] =
    useState<MaintenanceRequest[]>([]);

  const [requestsLoading, setRequestsLoading] =
    useState(true);

  const [requestsError, setRequestsError] =
    useState('');

  const [requestsRefresh, setRequestsRefresh] =
    useState(0);


  // Only unresolved requests count as open.

  const openRequests = maintenanceRequests.filter(
    request =>
      request.status === 'Submitted' ||
      request.status === 'In Progress'
  );


  // Load maintenance requests from the backend.

  useEffect(() => {

    if (
      user.databaseDemoStaff ||
      (activeTab !== 'Home' && activeTab !== 'Requests')
    ) {
      return;
    }

    let active = true;

    async function loadRequests() {

      setRequestsLoading(true);
      setRequestsError('');

      try {

        const requests = await getSupportRequests();

        const formattedRequests = requests
          .filter(
            request =>
              request.request_type === 'maintenance'
          )
          .map(formatMaintenanceRequest);

        if (active) {
          setMaintenanceRequests(formattedRequests);
        }

      } catch (err) {

        if (active) {
          setRequestsError(
            err instanceof Error
              ? err.message
              : 'Unable to load maintenance requests.'
          );
        }

      } finally {

        if (active) {
          setRequestsLoading(false);
        }

      }
    }

    loadRequests();

    return () => {
      active = false;
    };

  }, [activeTab, requestsRefresh, user.email]);


  // Update the dashboard clock.

  useEffect(() => {

    const timer = setInterval(
      () => setNow(new Date()),
      60000
    );

    return () => clearInterval(timer);

  }, []);


  // Scroll to the top when switching tabs.

  useEffect(() => {

    pageScroll.current?.scrollTo({
      y: 0,
      animated: false,
    });

    if (
      typeof window !== 'undefined' &&
      typeof window.scrollTo === 'function'
    ) {
      window.scrollTo(0, 0);
    }

  }, [activeTab]);


  const selectedHousehold = households.find(
    household => household.id === selectedHouseholdId
  );


  function openResidents(householdId?: string) {

    setSelectedHouseholdId(householdId);
    setActiveTab('ManageResidents');

  }


  function updateHouseholdResidents(
    update: SetStateAction<ManagedResident[]>
  ) {

    setResidents(previous => {

      const current = getHouseholdResidents(
        previous,
        selectedHouseholdId
      );

      const updated =
        typeof update === 'function'
          ? update(current)
          : update;

      return replaceHouseholdResidents(
        previous,
        selectedHouseholdId,
        updated
      );

    });

  }


  function openAnnouncement() {

    setTitle('');
    setMessage('');
    setError('');
    setCreatingAnnouncement(true);

  }


  function saveAnnouncement() {

    if (!title.trim() || !message.trim()) {

      setError('Enter a title and message.');
      return;

    }

    const updated = [
      {
        id: randomUUID(),
        title: title.trim(),
        message: message.trim(),
      },
      ...announcements,
    ];

    if (!saveAnnouncements(updated)) {
      setError('Could not save the announcement on this device. Try again.');
      return;
    }

    setAnnouncements(updated);
    setCreatingAnnouncement(false);
    setActiveTab('Announcements');

  }


  // Update the dashboard after a successful
  // maintenance status change.

  function handleStatusUpdated(
    requestId: number,
    status: MaintenanceStatus
  ) {

    const statusMap: Record<
      MaintenanceStatus,
      MaintenanceRequest['status']
    > = {
      submitted: 'Submitted',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };

    const displayStatus = statusMap[status];

    setMaintenanceRequests(previous =>
      previous.map(request =>
        request.backendId === requestId
          ? { ...request, status: displayStatus }
          : request
      )
    );

    setSelectedRequest(previous =>
      previous?.backendId === requestId
        ? { ...previous, status: displayStatus }
        : previous
    );

  }


  function closeModal() {

    setSelectedRequest(null);
    setCreatingAnnouncement(false);

  }


  return (

    <SafeAreaView edges={['top', 'left', 'right']} style={s.safeArea}>

      <View style={s.shell}>

        <ScrollView
          ref={pageScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.page}
        >

          <RoleDashboardHeader
            role="Property Manager"
            showLogo={false}
            showWordmark={false}
          />


          {/* Maintenance loading and refresh */}

          {!user.databaseDemoStaff &&
            (activeTab === 'Home' || activeTab === 'Requests') && (

            <View style={{ gap: 10 }}>

              {requestsLoading ? (

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >

                  <ActivityIndicator color="#627FE5" />

                  <Text
                    style={{
                      color: '#777777',
                      fontSize: 13,
                    }}
                  >
                    Loading maintenance requests...
                  </Text>

                </View>

              ) : (

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setRequestsRefresh(value => value + 1)
                  }
                  style={{ alignSelf: 'flex-end' }}
                >

                  <Text
                    style={{
                      color: '#627FE5',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Refresh requests
                  </Text>

                </Pressable>

              )}


              {!!requestsError && (

                <Text
                  accessibilityRole="alert"
                  style={{
                    color: '#B74343',
                    backgroundColor: '#FCEEEE',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  {requestsError}
                </Text>

              )}

            </View>

          )}


          {/* Home dashboard */}

          {activeTab === 'Home' && (user.databaseDemoStaff ? (
            <DatabaseRequests user={user} type="Maintenance" />
          ) : (
            <PropertyManagerHomeScreen
              name={data.name}
              now={now}
              property={demoProperty}
              requests={openRequests}
              onCreateAnnouncement={openAnnouncement}
              onAllRequests={() =>
                setActiveTab('Requests')
              }
              onRequest={setSelectedRequest}
              onManageResidents={() => openResidents()}
            />
          ))}


          {/* All maintenance requests */}

          {activeTab === 'Requests' && user.databaseDemoStaff && (
            <DatabaseRequests user={user} type="Maintenance" />
          )}

          {activeTab === 'Requests' &&
            !user.databaseDemoStaff &&
            !requestsLoading &&
            !requestsError && (

            <PropertyManagerRequestsScreen
              property={demoProperty}
              requests={maintenanceRequests}
              onSelect={setSelectedRequest}
            />

          )}


          {/* Announcements */}

          {activeTab === 'Announcements' && (

            <PropertyManagerAnnouncementsScreen
              property={demoProperty}
              announcements={announcements}
              onCreate={openAnnouncement}
            />

          )}


          {/* Properties */}

          {activeTab === 'Properties' && (

            <PropertyManagerPropertiesScreen
              property={demoProperty}
              households={households}
              residents={residents}
              onManageHousehold={openResidents}
              onCreateHousehold={name =>
                setHouseholds(previous => [
                  ...previous,
                  {
                    id: randomUUID(),
                    propertyName: demoProperty.name,
                    name,
                  },
                ])
              }
            />

          )}


          {/* Manage residents */}

          {activeTab === 'ManageResidents' && (

            <ManageResidentsScreen
              key={selectedHouseholdId || 'property'}
              propertyName={demoProperty.name}
              household={selectedHousehold}
              residents={getHouseholdResidents(
                residents,
                selectedHouseholdId
              )}
              setResidents={updateHouseholdResidents}
              onBack={() =>
                setActiveTab('Properties')
              }
            />

          )}


          {/* Profile */}

          {activeTab === 'Profile' && (

            <PropertyManagerProfileScreen
              user={user}
              name={data.name}
              propertyName={demoProperty.name}
              color={data.pet?.color}
              storageError={storageError}
              onSaveName={name =>
                setData(previous => ({
                  ...previous,
                  name,
                }))
              }
              onSignOut={onSignOut}
            />

          )}


        </ScrollView>


        <DashboardNavigation
          activeTab={
            activeTab === 'ManageResidents'
              ? 'Properties'
              : activeTab
          }
          onNavigate={setActiveTab}
          tabs={tabs}
        />

      </View>


      {/* Request details and announcement modal */}

      <Modal
        visible={
          !!selectedRequest || creatingAnnouncement
        }
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >

        <View style={s.backdrop}>

          <ScrollView
            style={s.modal}
            contentContainerStyle={s.modalContent}
            keyboardShouldPersistTaps="handled"
          >

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to dashboard"
              onPress={closeModal}
              style={s.back}
            >

              <Text style={s.backText}>
                {'<'}
              </Text>

            </Pressable>


            {selectedRequest && (

              <MaintenanceRequestDetailsScreen
                request={selectedRequest}
                onStatusUpdated={handleStatusUpdated}
              />

            )}


            {creatingAnnouncement && (

              <CreateAnnouncementScreen
                title={title}
                setTitle={setTitle}
                message={message}
                setMessage={setMessage}
                error={error}
                onSave={saveAnnouncement}
              />

            )}


          </ScrollView>

        </View>

      </Modal>

    </SafeAreaView>

  );

}
