import DashboardIcon from '../dashboard/DashboardIcon';
import { Pressable, Text, View } from 'react-native';
import { styles as s } from '../../styles/ProfileSupport.styles';

const paths = {
  wrench: 'm14 6 4-4a6 6 0 0 0-8 8L3 17a3 3 0 0 0 4 4l7-7a6 6 0 0 0 8-8l-4 4-4-4Z',
};
function Icon({ name }: { name: keyof typeof paths }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4056DE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>; }
export default function ProfileSupport({ onMaintenance, onContactRA }: { onMaintenance: () => void; onContactRA: () => void }) {
  return <View style={s.section}>
    <Pressable accessibilityRole="button" onPress={onMaintenance} style={({ pressed }) => [s.feature, s.maintenance, pressed && s.pressed]}><View style={s.row}><View style={s.icon}><Icon name="wrench" /></View><View style={s.copy}><Text style={s.featureTitle}>Report Maintenance Issue</Text><Text style={s.body}>Get help with your space.</Text></View><Text style={s.chevron}>›</Text></View><Text style={s.caption}>For property management</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={onContactRA} style={({ pressed }) => [s.feature, s.ra, pressed && s.pressed]}><View style={s.row}><View style={s.icon}><DashboardIcon name="group" color="#4056DE" size={20} /></View><View style={s.copy}><Text style={s.featureTitle}>Contact My RA</Text><Text style={s.body}>Send a support request.</Text></View><Text style={s.chevron}>›</Text></View><Text style={s.caption}>For Resident Assistant</Text></Pressable>
  </View>;
}
