import { Pressable, Text, View } from 'react-native';
import { getStaffCounterpart, type StaffRole, type StaffThread } from '../../data/staffChat';
import { styles as s } from '../../styles/StaffChat.styles';
import RoomiePet from '../RoomiePet';

type ProfileStaffChatProps = { role: StaffRole; thread: StaffThread; unread: number; color?: string; onOpen: () => void };

/** Profile entry point for the RA ↔ Property Manager chat. */
export default function ProfileStaffChat({ role, thread, unread, color, onOpen }: ProfileStaffChatProps) {
  const counterpart = getStaffCounterpart(role);
  const latest = thread.messages[thread.messages.length - 1];
  const title = `Message ${counterpart.roleLabel.toLowerCase()}`;
  const preview = latest ? `${latest.sender === role ? 'You' : counterpart.name}: ${latest.text}` : `Start a conversation with ${counterpart.name}.`;
  return (
    <View style={s.section}>
      <Pressable accessibilityRole="button" accessibilityLabel={unread ? `${title}, ${unread} unread` : title} onPress={onOpen} style={({ pressed }) => [s.entry, pressed && s.pressed]}>
        <RoomiePet role={counterpart.role} color={color} size={64} />
        <View style={s.entryCopy}>
          <Text style={s.entryTitle}>{title}</Text>
          <Text numberOfLines={1} style={s.entryPreview}>{preview}</Text>
        </View>
        {unread > 0 ? <View style={s.unreadBadge}><Text style={s.unreadText}>{unread > 9 ? '9+' : unread}</Text></View> : <Text style={s.chevron}>›</Text>}
      </Pressable>
    </View>
  );
}
