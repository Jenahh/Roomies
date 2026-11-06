import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import { styles as s } from '../../styles/ResidentVerificationScreen.styles';
import '../../styles/ResidentVerificationScreen.css';

export default function ResidentVerificationScreen({ onBack, onContinueAdmin }: { onBack: () => void; onContinueAdmin: () => void }) {
  return <SafeAreaView style={s.safeArea}><View style={s.page}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to role selection" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable></View>
    <View style={s.content}>
      <Text accessibilityRole="header" style={s.title}>Your request is in.</Text>
      <div className="verification-pet" role="status" aria-label="Awaiting property manager approval">
        <img className="verification-pet-image" src={getHatlessPetImage()} alt="Roomie Pet" />
        <div className="verification-dots" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <Text style={s.note}>You must be approved by your property manager before you can access your household.</Text>
    </View>
    <Pressable accessibilityRole="button" onPress={onContinueAdmin} style={({ pressed }) => [s.continueButton, pressed && s.pressed]}><Text style={s.continueText}>Continue (Admin)</Text></Pressable>
  </View></SafeAreaView>;
}
