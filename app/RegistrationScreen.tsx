import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import roomiesLogo from '../assets/Roomies Logo.png';
import { styles } from './RegistrationScreen.styles';

const roles = [
  { id: 'resident', title: 'Resident / Roommate', description: 'Manage your shared home', icon: '⌂', color: '#EDF0FF', label: 'Resident' },
  { id: 'assistant', title: 'Resident Assistant', description: 'Support your residents', icon: '♡', color: '#F2EEFF', label: 'Resident Assistant' },
  { id: 'landlord', title: 'Landlord / Property Manager', description: 'Manage your community', icon: '▥', color: '#EAF6F0', label: 'Landlord' },
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
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>
          <Image source={{ uri: roomiesLogo }} style={styles.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />
          <Text style={styles.wordmark}>Roomies</Text>
          <Text style={styles.headerCaption}>Choose your role</Text>
        </View>

        <Text accessibilityRole="header" style={styles.title}>How will you use{'\n'}Roomies?</Text>
        <Text style={styles.subtitle}>A shared home. A little support. Find the space that’s right for you.</Text>

        <View accessibilityRole="radiogroup" accessibilityLabel="Your role" style={styles.roles}>
          {roles.map(role => {
            const isSelected = role.id === selectedRole;
            return (
              <Pressable key={role.id} accessibilityRole="radio" accessibilityState={{ checked: isSelected }} onPress={() => setSelectedRole(role.id)} style={[styles.card, isSelected && styles.selectedCard]}>
                <View style={[styles.iconBox, { backgroundColor: role.color }]}><Text style={styles.icon}>{role.icon}</Text></View>
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.selectedRadio]}>{isSelected && <View style={styles.radioDot} />}</View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>{'\u24D8'}</Text>
          <Text style={styles.noticeText}>Choosing a role does not grant permissions. Professional roles require an invitation or administrator approval.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => onContinue?.(selectedRole)} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>Continue as {selected.label}</Text>
          <Text style={styles.continueArrow} aria-hidden>{'\u2192'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
