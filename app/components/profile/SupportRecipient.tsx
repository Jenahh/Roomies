
import { Text, View } from 'react-native';
import { useResidentAssignment } from '../../hooks/useResidentAssignment';


type Props = {
  kind: 'maintenance' | 'ra';
};


export default function SupportRecipient({ kind }: Props) {

  const {
    assignment,
    loading,
    assignmentError,
  } = useResidentAssignment();

  const isMaintenance = kind === 'maintenance';

  const recipient = isMaintenance
    ? assignment?.property_manager
    : assignment?.resident_assistant;

  const location = isMaintenance
    ? assignment?.household.name
    : assignment?.group.name;


  return (
    <View
      style={{
        backgroundColor: '#EDEEFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        gap: 5,
      }}
    >

      <Text
        style={{
          color: '#777777',
          fontSize: 12,
        }}
      >
        {isMaintenance
          ? 'Sending to your property manager'
          : 'Sending to your RA'}
      </Text>

      {loading ? (

        <Text style={{ color: '#777777' }}>
          Finding your assigned staff member...
        </Text>

      ) : assignmentError ? (

        <Text
          accessibilityRole="alert"
          style={{ color: '#B85454', fontSize: 13 }}
        >
          {assignmentError}
        </Text>

      ) : (

        <>
          <Text
            style={{
              color: '#5366BC',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {recipient?.name}
          </Text>

          <Text
            style={{
              color: '#777777',
              fontSize: 13,
            }}
          >
            {location}
          </Text>
        </>

      )}

    </View>
  );
}
