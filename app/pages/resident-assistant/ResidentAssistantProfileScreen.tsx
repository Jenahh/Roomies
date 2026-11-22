
import { useEffect, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import type { ResidentUser } from '../../data/demoAccount';

import ProfileEditor from '../../components/profile/ProfileEditor';

import {
  getRAResidents,
  type RAResident,
} from '../../services/api';

type ResidentAssistantProfileScreenProps = {
  user: ResidentUser;
  name: string;
  hall: string;
  color?: string;
  storageError: string;
  onSaveName: (name: string) => void;
  onSignOut: () => void;
};

export default function ResidentAssistantProfileScreen({
  user,
  name,
  hall,
  color,
  storageError,
  onSaveName,
  onSignOut,
}: ResidentAssistantProfileScreenProps) {
  const [expanded, setExpanded] = useState(false);
  const [residents, setResidents] = useState<RAResident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!expanded) return;

    let active = true;

    async function loadResidents() {
      setLoading(true);
      setError('');

      try {
        const result = await getRAResidents();

        if (active) {
          setResidents(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load residents.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResidents();

    return () => {
      active = false;
    };
  }, [expanded, refresh]);

  return (
    <View style={styles.container}>
      {/* Existing profile editor */}

      <ProfileEditor
        name={name}
        email={user.email}
        role={user.role}
        color={color}
        locationLabel="Assigned hall"
        location={hall}
        storageError={storageError}
        onSave={values => onSaveName(values.name)}
        onSignOut={onSignOut}
      />

      {/* My Residents expandable section */}

      <View style={styles.section}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded(value => !value)}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>
              {'👥'}
            </Text>

            <View style={styles.sectionText}>
              <Text style={styles.sectionTitle}>
                My Residents
              </Text>

              <Text style={styles.sectionSubtitle}>
                View residents assigned to you
              </Text>
            </View>
          </View>

          <Text style={styles.chevron}>
            {expanded ? '⌃' : '⌄'}
          </Text>
        </Pressable>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>
                Assigned Residents
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={() =>
                  setRefresh(value => value + 1)
                }
              >
                <Text style={styles.refreshText}>
                  Refresh
                </Text>
              </Pressable>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#627FE5"
                />

                <Text style={styles.helperText}>
                  Loading residents...
                </Text>
              </View>
            )}

            {!!error && !loading && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}

            {!loading && !error && (
              <>
                <Text style={styles.countText}>
                  {residents.length}{' '}
                  {residents.length === 1
                    ? 'resident'
                    : 'residents'}{' '}
                  assigned
                </Text>

                {residents.length === 0 && (
                  <Text style={styles.helperText}>
                    No residents are currently assigned to you.
                  </Text>
                )}

                {residents.map(resident => (
                  <View
                    key={resident.id}
                    style={styles.residentCard}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.initials}>
                        {resident.name
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.residentDetails}>
                      <Text style={styles.residentName}>
                        {resident.name}
                      </Text>

                      <Text style={styles.residentInfo}>
                        {resident.household_name}
                      </Text>

                      <Text style={styles.residentInfo}>
                        {resident.group_name}
                      </Text>

                      <Text style={styles.residentEmail}>
                        {resident.email}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 16,
    overflow: 'hidden',
  },

  sectionHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  sectionIcon: {
    fontSize: 23,
  },

  sectionText: {
    flex: 1,
    gap: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242630',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#777777',
  },

  chevron: {
    fontSize: 23,
    color: '#627FE5',
    paddingHorizontal: 4,
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#E4E6F0',
    padding: 16,
    gap: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242630',
  },

  refreshText: {
    color: '#627FE5',
    fontSize: 13,
    fontWeight: '600',
  },

  countText: {
    fontSize: 12,
    color: '#777777',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },

  helperText: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 20,
  },

  errorText: {
    fontSize: 13,
    color: '#B74343',
    backgroundColor: '#FCEEEE',
    borderRadius: 10,
    padding: 12,
  },

  residentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F7F8FC',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDEEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: '#5366BC',
    fontSize: 17,
    fontWeight: '700',
  },

  residentDetails: {
    flex: 1,
    gap: 3,
  },

  residentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242630',
  },

  residentInfo: {
    fontSize: 12,
    color: '#777777',
  },

  residentEmail: {
    fontSize: 12,
    color: '#627FE5',
  },
});
