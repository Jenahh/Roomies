import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import roomiesLogo from '../../../assets/Roomies Logo.png';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';
import { getImageSource } from '../../utils/imageSource';

export default function RoleDashboardHeader({ role, style, showLogo = true, showWordmark = true, pageTitle }: { role: string; style?: StyleProp<ViewStyle>; showLogo?: boolean; showWordmark?: boolean; pageTitle?: string }) {
  return (
    <View style={[s.header, style]}>
      {pageTitle ? <Text accessibilityRole="header" numberOfLines={1} style={{ fontSize: 26, fontWeight: '700', color: '#292B35' }}>{pageTitle}</Text> : <>
        {showLogo && <Image source={getImageSource(roomiesLogo)} style={s.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />}
        {showWordmark && <Text style={s.wordmark}>Roomies</Text>}
        <Text style={s.role}>{role.toUpperCase()}</Text>
      </>}
    </View>
  );
}
