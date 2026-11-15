import { Fragment, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getStaffCounterpart, isStaffMessageSeen, MAX_STAFF_MESSAGE_LENGTH, type StaffRole } from '../../data/staffChat';
import type { StaffChat } from '../../hooks/useStaffChat';
import { styles as s } from '../../styles/StaffChat.styles';
import RoomiePet from '../RoomiePet';

type StaffChatScreenProps = { role: StaffRole; hall: string; chat: StaffChat; color?: string; onBack: () => void };

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(date: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return 'Today';
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** One-to-one conversation between a Resident Assistant and the Property Manager, opened from Profile. */
export default function StaffChatScreen({ role, hall, chat, color, onBack }: StaffChatScreenProps) {
  const { thread, send, markRead, storageError } = chat;
  const counterpart = getStaffCounterpart(role);
  const [draft, setDraft] = useState('');
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const now = new Date();
  const lastMine = [...thread.messages].reverse().find(message => message.sender === role);
  const canSend = !!draft.trim();

  // Keep the newest message in view and mark incoming messages read while the chat is open.
  useEffect(() => {
    list.current?.scrollToEnd({ animated: false });
    markRead();
  }, [thread.messages.length, markRead]);

  function submit() {
    if (!canSend) return;
    send(draft);
    setDraft('');
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.backArrow}><Text style={s.backArrowText}>{'<'}</Text></Pressable>
      <View style={s.header}>
        <RoomiePet role={counterpart.role} color={color} size={52} />
        <View style={s.headerCopy}>
          <Text accessibilityRole="header" style={s.title}>{counterpart.name}</Text>
          <Text style={s.subtitle}>{counterpart.roleLabel} · {hall}</Text>
        </View>
      </View>
      <ScrollView ref={list} accessibilityLabel={`Conversation with ${counterpart.name}`} style={s.messages} contentContainerStyle={s.messagesContent} onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}>
        {!thread.messages.length && (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No messages yet</Text>
            <Text style={s.emptyText}>Send {counterpart.name} a message about {hall}.</Text>
          </View>
        )}
        {thread.messages.map((message, index) => {
          const mine = message.sender === role;
          const sent = new Date(message.sentAt);
          const previous = thread.messages[index - 1];
          const newDay = !previous || dayKey(new Date(previous.sentAt)) !== dayKey(sent);
          const time = sent.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
          const seen = message === lastMine && isStaffMessageSeen(thread, message);
          return (
            <Fragment key={message.id}>
              {newDay && <Text style={s.day}>{dayLabel(sent, now)}</Text>}
              <View accessibilityLabel={`${mine ? 'You' : counterpart.name}, ${time}: ${message.text}`} style={[s.bubble, mine ? s.mine : s.theirs]}>
                <Text selectable style={[s.bubbleText, mine && s.mineText]}>{message.text}</Text>
              </View>
              <Text style={[s.meta, mine ? s.metaMine : s.metaTheirs]}>{time}{seen ? ' · Seen' : ''}</Text>
            </Fragment>
          );
        })}
      </ScrollView>
      <View style={s.composer}>
        <TextInput
          accessibilityLabel={`Message ${counterpart.name}`}
          multiline
          value={draft}
          onChangeText={setDraft}
          maxLength={MAX_STAFF_MESSAGE_LENGTH}
          placeholder={`Message ${counterpart.name}`}
          placeholderTextColor="#7B7D87"
          onKeyPress={event => {
            // Enter sends; Shift+Enter adds a new line.
            const { key, shiftKey } = event.nativeEvent as { key: string; shiftKey?: boolean };
            if (key === 'Enter' && !shiftKey) { event.preventDefault(); submit(); }
          }}
          style={s.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: !canSend }} disabled={!canSend} onPress={submit} style={({ pressed }) => [s.send, !canSend && s.sendDisabled, pressed && s.pressed]}>
          <Text style={s.sendText}>Send</Text>
        </Pressable>
      </View>
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      <Text style={s.note}>Only you and {counterpart.name} can see this conversation.</Text>
    </>
  );
}
