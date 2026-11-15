import { Pressable, SafeAreaView, Text, View } from 'react-native';
import SignupProgress from '../../components/auth/SignupProgress';
import VerificationPet from '../../components/auth/VerificationPet';
import { styles as s } from '../../styles/ResidentVerificationScreen.styles';

export default function ResidentVerificationScreen({ onBack, onContinueAdmin }: { onBack: () => void; onContinueAdmin: () => void }) {
  return <SafeAreaView style={s.safeArea}><View style={s.page}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to role selection" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable></View>
    <SignupProgress step={4} />
    <View style={s.content}>
      <Text accessibilityRole="header" style={s.title}>Your request is in.</Text>
      <VerificationPet label="Awaiting property manager approval" mood="happy" />
      <Text style={s.note}>You must be approved by your property manager before you can access your household.</Text>
    </View>
    <Pressable accessibilityRole="button" onPress={onContinueAdmin} style={({ pressed }) => [s.continueButton, pressed && s.pressed]}><Text style={s.continueText}>Continue (Admin)</Text></Pressable>
  </View></SafeAreaView>;
}
