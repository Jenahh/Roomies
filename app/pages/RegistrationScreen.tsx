import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import roomiesLogo from '../../assets/Roomies Logo.png';
import RoomiePet from '../components/RoomiePet';
import SignupProgress from '../components/auth/SignupProgress';
import { styles } from '../styles/RegistrationScreen.styles';

const roles = [
  { id: 'resident', title: 'Resident', description: 'Manage your shared home', color: '#EDF0FF', label: 'Resident' },
  { id: 'assistant', title: 'Resident Assistant', description: 'Support your residents', color: '#F2EEFF', label: 'Resident Assistant' },
  { id: 'landlord', title: 'Property Manager', description: 'Manage your community', color: '#EAF6F0', label: 'Property Manager' },
] as const;

type Role = typeof roles[number]['id'];
type RegistrationScreenProps = {
  onBack?: () => void;
  onContinue?: (role: Role) => void;
};

export default function RegistrationScreen({ onBack, onContinue }: RegistrationScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('resident');
  const selected = roles.find(role => role.id === selectedRole)!;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to welcome" style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Image source={{ uri: roomiesLogo }} style={styles.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />
          <Text style={styles.wordmark}>Roomies</Text>
        </View>

        <SignupProgress step={1} />
        <Text accessibilityRole="header" style={styles.title}>Choose your role</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Your role" style={styles.roles}>
          {roles.map(role => {
            const isSelected = role.id === selectedRole;
            return (
              <Pressable key={role.id} accessibilityRole="radio" accessibilityState={{ checked: isSelected }} onPress={() => setSelectedRole(role.id)} style={[styles.card, isSelected && styles.selectedCard]}>
                <View style={[styles.iconBox, { backgroundColor: role.color }]}>
                  {role.id === 'assistant'
                    ? <RoomiePet role="assistant" size={64} accessibilityLabel="Resident Assistant Roomie" />
                    : role.id === 'landlord'
                      ? <RoomiePet role="property-manager" size={64} accessibilityLabel="Property Manager Roomie" />
                      : <RoomiePet mood="happy-3d" size={64} accessibilityLabel="Resident Roomie Pet" />}
                </View>
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.selectedRadio]}>{isSelected && <View style={styles.radioDot} />}</View>
              </Pressable>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" onPress={() => onContinue?.(selectedRole)} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>Continue as {selected.label}</Text>
          
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
