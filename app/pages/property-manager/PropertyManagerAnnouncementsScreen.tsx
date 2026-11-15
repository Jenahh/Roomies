import { Pressable, Text, View } from 'react-native';
import type { Announcement } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

export default function PropertyManagerAnnouncementsScreen({ property: demoProperty, announcements, onCreate: openAnnouncement }: { property: { name: string }; announcements: Announcement[]; onCreate: () => void }) {
  return <>
<Text accessibilityRole="header" style={s.title}>Announcements</Text>
            <Text style={s.subtitle}>{demoProperty.name}</Text>
            <Pressable accessibilityRole="button" onPress={openAnnouncement} style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}><Text style={s.primaryText}>Create Announcement</Text></Pressable>
            {!announcements.length && <Text style={s.empty}>No announcements yet.</Text>}
            {announcements.map(announcement => <View key={announcement.id} style={s.card}><View style={s.request}><Text style={s.cardTitle}>{announcement.title}</Text><Text style={s.overviewText}>{announcement.message}</Text></View></View>)}
  </>;
}
