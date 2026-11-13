import { Pressable, SafeAreaView, Text, View } from 'react-native';
import RoomiePet from '../../components/RoomiePet';
import SignupProgress from '../../components/auth/SignupProgress';
import { styles as s } from '../../styles/ResidentVerificationScreen.styles';
import '../../styles/ResidentVerificationScreen.css';

export default function PropertyManagerVerificationScreen({ onBack, onContinueAdmin }: { onBack: () => void; onContinueAdmin: () => void }) {
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.page}>
        <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to property manager join code" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable></View>
        <SignupProgress step={4} />
        <View style={s.content}>
          <Text accessibilityRole="header" style={s.title}>Your manager request is in.</Text>
          <div className="verification-pet" role="status" aria-label="Awaiting administrator approval for Property Manager access">
            <RoomiePet className="verification-pet-image" role="property-manager" size={160} accessibilityLabel="Property Manager Roomie" />
            <div className="verification-dots" aria-hidden="true"><span /><span /><span /></div>
          </div>
          <Text style={s.note}>Your administrator must approve your Property Manager role before you can access your property.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onContinueAdmin} style={({ pressed }) => [s.continueButton, pressed && s.pressed]}><Text style={s.continueText}>Continue (Admin)</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
