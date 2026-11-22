
import { useEffect, useState } from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  getSupportRequests,
  getSupportReplies,
  sendSupportReply,
  getRAResidents,
  createRAConversation,
  type SupportRequestResponse,
  type SupportReply,
  type RAResident,
} from '../../services/api';

import {
  styles as s,
} from '../../styles/ResidentAssistantDashboard.styles';

export default function ResidentAssistantMessagesScreen() {
  const [messages, setMessages] =
    useState<SupportRequestResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [showNewMessage, setShowNewMessage] =
    useState(false);

  const [residents, setResidents] = useState<RAResident[]>([]);
  const [loadingResidents, setLoadingResidents] =
    useState(false);

  const [selectedResidentId, setSelectedResidentId] =
    useState<number | null>(null);

  const [subject, setSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');

  const selectedMessage = messages.find(
    message => message.id === selectedId
  );

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      setLoading(true);
      setError('');

      try {
        const requests = await getSupportRequests();

        if (active) {
          setMessages(
            requests.filter(
              request =>
                request.request_type === 'ra_message'
            )
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load messages.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!showNewMessage) return;

    let active = true;
    setLoadingResidents(true);
    setFormError('');

    getRAResidents()
      .then(result => {
        if (active) setResidents(result);
      })
      .catch(err => {
        if (active) {
          setFormError(
            err instanceof Error
              ? err.message
              : 'Unable to load residents.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingResidents(false);
      });

    return () => {
      active = false;
    };
  }, [showNewMessage]);

  useEffect(() => {
    if (selectedId === null) {
      setReplies([]);
      return;
    }

    let active = true;
    setLoadingReplies(true);
    setReplyError('');

    getSupportReplies(selectedId)
      .then(result => {
        if (active) setReplies(result);
      })
      .catch(err => {
        if (active) {
          setReplyError(
            err instanceof Error
              ? err.message
              : 'Unable to load conversation.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingReplies(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  async function handleCreateConversation() {
    if (
      creating ||
      selectedResidentId === null ||
      !subject.trim() ||
      !newMessage.trim()
    ) {
      setFormError(
        'Please select a resident and enter a subject and message.'
      );
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      const conversation = await createRAConversation(
        selectedResidentId,
        subject.trim(),
        newMessage.trim()
      );

      setMessages(current => [conversation, ...current]);
      setShowNewMessage(false);
      setSelectedResidentId(null);
      setSubject('');
      setNewMessage('');
      setSelectedId(conversation.id);

      // Reload to retrieve the complete housing information.
      setRefresh(value => value + 1);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Unable to create conversation.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSendReply() {
    if (
      !selectedMessage ||
      sendingReply ||
      !replyText.trim()
    ) {
      return;
    }

    setSendingReply(true);
    setReplyError('');

    try {
      const reply = await sendSupportReply(
        selectedMessage.id,
        replyText.trim()
      );

      setReplies(current => [...current, reply]);
      setReplyText('');
    } catch (err) {
      setReplyError(
        err instanceof Error
          ? err.message
          : 'Unable to send reply.'
      );
    } finally {
      setSendingReply(false);
    }
  }

  async function refreshConversation() {
    if (!selectedMessage || loadingReplies) return;

    setLoadingReplies(true);
    setReplyError('');

    try {
      const result = await getSupportReplies(
        selectedMessage.id
      );
      setReplies(result);
    } catch (err) {
      setReplyError(
        err instanceof Error
          ? err.message
          : 'Unable to refresh conversation.'
      );
    } finally {
      setLoadingReplies(false);
    }
  }

  // ========================================
  // NEW MESSAGE FORM
  // ========================================

  if (showNewMessage) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => setShowNewMessage(false)}
          disabled={creating}
        >
          <Text style={styles.back}>
            {'< Back to messages'}
          </Text>
        </Pressable>

        <Text style={s.title}>New Message</Text>

        <Text style={styles.subtitle}>
          Start a conversation with one of your assigned residents.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Select a resident</Text>

          {loadingResidents && (
            <ActivityIndicator color="#627FE5" />
          )}

          {!loadingResidents && residents.length === 0 && (
            <Text style={styles.meta}>
              No assigned residents found.
            </Text>
          )}

          <ScrollView
            style={styles.residentList}
            nestedScrollEnabled
          >
            {residents.map(resident => {
              const selected =
                selectedResidentId === resident.id;

              return (
                <Pressable
                  key={resident.id}
                  accessibilityRole="button"
                  onPress={() =>
                    setSelectedResidentId(resident.id)
                  }
                  style={[
                    styles.residentOption,
                    selected && styles.selectedResident,
                  ]}
                >
                  <Text style={styles.residentName}>
                    {selected ? '✓ ' : ''}
                    {resident.name}
                  </Text>

                  <Text style={styles.meta}>
                    {[
                      resident.group_name,
                      resident.household_name,
                    ].filter(Boolean).join(' · ')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Subject</Text>

          <TextInput
            accessibilityLabel="Conversation subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Upcoming room inspection"
            maxLength={200}
            style={styles.input}
          />

          <Text style={styles.label}>Message</Text>

          <TextInput
            accessibilityLabel="New message"
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Write your message..."
            multiline
            maxLength={10000}
            style={[styles.input, styles.multilineInput]}
          />

          {!!formError && (
            <Text style={styles.error}>{formError}</Text>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={handleCreateConversation}
            disabled={
              creating ||
              selectedResidentId === null ||
              !subject.trim() ||
              !newMessage.trim()
            }
            style={[
              styles.sendButton,
              (creating ||
                selectedResidentId === null ||
                !subject.trim() ||
                !newMessage.trim()) &&
                styles.disabledButton,
            ]}
          >
            {creating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>
                Send Message
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // ========================================
  // CONVERSATION DETAILS
  // ========================================

  if (selectedMessage) {
    const isRAInitiated =
      selectedMessage.sender_id !==
      selectedMessage.recipient_id &&
      selectedMessage.sender_name !== null &&
      selectedMessage.recipient_name !== null;

    return (
      <View style={styles.container}>
        <Pressable onPress={() => setSelectedId(null)}>
          <Text style={styles.back}>
            {'< Back to messages'}
          </Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.category}>
            {selectedMessage.category}
          </Text>

          <Text style={styles.subject}>
            {selectedMessage.subject}
          </Text>

          <Text style={styles.meta}>
            From: {selectedMessage.sender_name ||
              `User #${selectedMessage.sender_id}`}
          </Text>

          <Text style={styles.meta}>
            To: {selectedMessage.recipient_name ||
              `User #${selectedMessage.recipient_id}`}
          </Text>

          {!!selectedMessage.group_name && (
            <Text style={styles.meta}>
              {selectedMessage.group_name}
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>
            Conversation
          </Text>

          <View style={styles.conversationList}>
            <View
              style={[
                styles.messageBubble,
                styles.residentBubble,
              ]}
            >
              <Text style={styles.messageSender}>
                {selectedMessage.sender_name || 'Sender'}
              </Text>

              <Text style={styles.messageText}>
                {selectedMessage.description}
              </Text>

              <Text style={styles.messageDate}>
                {new Date(
                  selectedMessage.created_at
                ).toLocaleString()}
              </Text>
            </View>

            {loadingReplies ? (
              <ActivityIndicator color="#627FE5" />
            ) : (
              replies.map(reply => (
                <View
                  key={reply.id}
                  style={[
                    styles.messageBubble,
                    reply.sender_id ===
                    selectedMessage.sender_id
                      ? styles.residentBubble
                      : styles.raBubble,
                  ]}
                >
                  <Text style={styles.messageSender}>
                    {reply.sender_name || 'User'}
                  </Text>

                  <Text style={styles.messageText}>
                    {reply.message}
                  </Text>

                  <Text style={styles.messageDate}>
                    {new Date(
                      reply.created_at
                    ).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          {!!replyError && (
            <Text style={styles.error}>{replyError}</Text>
          )}

          <TextInput
            accessibilityLabel="Reply"
            placeholder="Write a reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={10000}
            style={[styles.input, styles.multilineInput]}
          />

          <Pressable
            onPress={handleSendReply}
            disabled={sendingReply || !replyText.trim()}
            style={[
              styles.sendButton,
              (sendingReply || !replyText.trim()) &&
                styles.disabledButton,
            ]}
          >
            {sendingReply ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>
                Send Reply
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={refreshConversation}
            disabled={loadingReplies}
          >
            <Text style={styles.refresh}>
              Refresh conversation
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ========================================
  // MESSAGE INBOX
  // ========================================

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={s.title}>Messages</Text>

        <Pressable
          onPress={() => setRefresh(value => value + 1)}
          disabled={loading}
        >
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Conversations with your assigned residents.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowNewMessage(true)}
        style={styles.sendButton}
      >
        <Text style={styles.sendButtonText}>
          + New Message
        </Text>
      </Pressable>

      {loading && (
        <ActivityIndicator color="#627FE5" />
      )}

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && messages.length === 0 && (
        <Text style={s.empty}>No messages yet.</Text>
      )}

      {!loading && !error && messages.map(message => (
        <Pressable
          key={message.id}
          accessibilityRole="button"
          onPress={() => setSelectedId(message.id)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.category}>
              {message.category}
            </Text>

            <Text style={styles.meta}>
              {new Date(
                message.created_at
              ).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.subject}>
            {message.subject}
          </Text>

          <Text style={styles.residentName}>
            {message.sender_name || 'Sender'}
            {' → '}
            {message.recipient_name || 'Recipient'}
          </Text>

          <Text
            numberOfLines={2}
            style={styles.description}
          >
            {message.description}
          </Text>

          <Text style={styles.link}>
            View conversation {'>'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 8,
  },
  refresh: {
    fontSize: 14,
    fontWeight: '600',
    color: '#627FE5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEEFF',
    color: '#5366BC',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#242630',
  },
  residentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5366BC',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
  },
  meta: {
    fontSize: 12,
    color: '#777777',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#454550',
  },
  link: {
    color: '#627FE5',
    fontSize: 13,
    fontWeight: '600',
  },
  back: {
    color: '#627FE5',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E6F0',
    marginVertical: 6,
  },
  error: {
    color: '#B74343',
    backgroundColor: '#FCEEEE',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#242630',
  },
  conversationList: {
    gap: 12,
    marginVertical: 8,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 12,
    maxWidth: '90%',
    gap: 6,
  },
  residentBubble: {
    backgroundColor: '#F5F6FC',
    alignSelf: 'flex-start',
  },
  raBubble: {
    backgroundColor: '#EDEEFF',
    alignSelf: 'flex-end',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5366BC',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#242630',
  },
  messageDate: {
    fontSize: 11,
    color: '#777777',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    fontSize: 14,
    color: '#242630',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#627FE5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  residentList: {
    maxHeight: 220,
  },
  residentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedResident: {
    borderColor: '#627FE5',
    backgroundColor: '#EDEEFF',
  },
});
