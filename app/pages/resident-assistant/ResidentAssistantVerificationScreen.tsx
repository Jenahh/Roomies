import { Pressable, SafeAreaView, Text, View } from 'react-native';
import DashboardIcon from '../../components/dashboard/DashboardIcon';
import { styles as s } from '../../styles/ResidentVerificationScreen.styles';
import '../../styles/ResidentVerificationScreen.css';

export default function ResidentAssistantVerificationScreen({ onBack, onContinueAdmin }: { onBack: () => void; onContinueAdmin: () => void }) {
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.page}>
        <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to RA join code" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable></View>
        <View style={s.content}>
          <Text accessibilityRole="header" style={s.title}>Your RA request is in.</Text>
          <div className="verification-pet" role="status" aria-label="Awaiting property manager approval for Resident Assistant access">
            <DashboardIcon name="group" size={100} color="#657EEA" />
            <div className="verification-dots" aria-hidden="true"><span /><span /><span /></div>
          </div>
          <Text style={s.note}>Your property manager must approve your Resident Assistant role before you can access your assigned hall.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onContinueAdmin} style={({ pressed }) => [s.continueButton, pressed && s.pressed]}><Text style={s.continueText}>Continue (Admin)</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
