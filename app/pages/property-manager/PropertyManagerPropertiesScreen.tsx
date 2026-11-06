import { Pressable, Text, View } from 'react-native';
import CreateHouseholdCard from '../../components/property-manager/CreateHouseholdCard';
import type { ManagedHousehold, ManagedResident } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

type PropertyManagerPropertiesScreenProps = {
  property: { name: string; homes: number; activeHomes: number; activeResidents: number; weeklyEngagement: number };
  households: ManagedHousehold[];
  residents: ManagedResident[];
  onCreateHousehold: (name: string) => void;
  onManageHousehold: (householdId: string) => void;
};

export default function PropertyManagerPropertiesScreen({ property, households, residents, onCreateHousehold, onManageHousehold }: PropertyManagerPropertiesScreenProps) {
  const propertyHouseholds = households.filter(household => household.propertyName === property.name);
  return (
    <>
      <Text accessibilityRole="header" style={s.title}>Properties</Text>
      <Text style={s.subtitle}>{property.name}</Text>
      <CreateHouseholdCard existingNames={propertyHouseholds.map(household => household.name)} onCreate={onCreateHousehold} />
      {propertyHouseholds.length > 0 && <>
        <Text accessibilityRole="header" style={s.sectionTitle}>Households</Text>
        {propertyHouseholds.map(household => {
          const members = residents.filter(resident => resident.householdId === household.id);
          const active = members.filter(resident => resident.access === 'Active').length;
          const pending = members.filter(resident => resident.access === 'Invited').length;
          return <View key={household.id} style={s.card}><View style={s.request}>
            <Text style={s.cardTitle}>{household.name}</Text>
            <Text style={s.detail}>{active} active residents · {pending} invitations pending</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Manage residents in ${household.name}`} onPress={() => onManageHousehold(household.id)} style={({ pressed }) => [s.primaryButton, s.manageResidentsButton, pressed && s.pressed]}><Text style={s.primaryText}>Manage Residents</Text></Pressable>
          </View></View>;
        })}
      </>}
    </>
  );
}
