import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import roomiesLogo from '../../../assets/Roomies Logo.png';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function RoleDashboardHeader({ role, style, showLogo = true, showWordmark = true }: { role: string; style?: StyleProp<ViewStyle>; showLogo?: boolean; showWordmark?: boolean }) {
  return (
    <View style={[s.header, style]}>
      {showLogo && <Image source={{ uri: roomiesLogo }} style={s.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />}
      {showWordmark && <Text style={s.wordmark}>Roomies</Text>}
      <Text style={s.role}>{role.toUpperCase()}</Text>
    </View>
  );
}
