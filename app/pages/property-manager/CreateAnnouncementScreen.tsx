import { Pressable, Text, TextInput } from 'react-native';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

export default function CreateAnnouncementScreen({ title, setTitle, message, setMessage, error, onSave: saveAnnouncement }: { title: string; setTitle: (value: string) => void; message: string; setMessage: (value: string) => void; error: string; onSave: () => void }) {
  return <>
<Text accessibilityRole="header" style={s.sectionTitle}>Create Announcement</Text>
              <Text style={s.label}>Title</Text>
              <TextInput accessibilityLabel="Announcement title" value={title} onChangeText={setTitle} maxLength={120} style={s.input} />
              <Text style={s.label}>Message</Text>
              <TextInput accessibilityLabel="Announcement message" value={message} onChangeText={setMessage} multiline maxLength={2000} style={[s.input, s.messageInput]} />
              {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
              <Text style={s.detail}>Save a demo announcement for this session.</Text>
              <Pressable accessibilityRole="button" onPress={saveAnnouncement} style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}><Text style={s.primaryText}>Save announcement</Text></Pressable>
  </>;
}
