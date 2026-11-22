
import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  MaintenanceRequest,
} from '../../data/demoPropertyManager';

import {
  getSupportReplies,
  sendSupportReply,
  updateMaintenanceStatus,
  type MaintenanceStatus,
  type SupportReply,
} from '../../services/api';

import {
  styles as s,
} from '../../styles/PropertyManagerDashboard.styles';

type Props = {
  request: MaintenanceRequest;

  onStatusUpdated: (
    requestId: number,
    status: MaintenanceStatus
  ) => void;
};

// ========================================
// MAINTENANCE STATUS OPTIONS
// ========================================

const statusOptions: {
  value: MaintenanceStatus;
  label: string;
}[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const statusToBackend: Record<
  MaintenanceRequest['status'],
  MaintenanceStatus
> = {
  Submitted: 'submitted',
  'In Progress': 'in_progress',
  Resolved: 'resolved',
  Closed: 'closed',
};

// ========================================
// MAIN COMPONENT
// ========================================

export default function MaintenanceRequestDetailsScreen({
  request,
  onStatusUpdated,
}: Props) {
  // Maintenance status state
  const [status, setStatus] = useState<MaintenanceStatus>(
    statusToBackend[request.status]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const savingLock = useRef(false);

  // Conversation state
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const sendingReplyLock = useRef(false);

  // ========================================
  // RESET STATUS WHEN REQUEST CHANGES
  // ========================================

  useEffect(() => {
    setStatus(statusToBackend[request.status]);
    setError('');
    setSuccess('');
  }, [request.id, request.status]);

  // ========================================
  // LOAD CONVERSATION
  // ========================================

  useEffect(() => {
    let active = true;

    setReplies([]);
    setReplyText('');
    setReplyError('');
    setReplySuccess('');

    if (request.backendId === undefined) {
      setLoadingReplies(false);
      return;
    }

    setLoadingReplies(true);

    getSupportReplies(request.backendId)
      .then(data => {
        if (active) {
          setReplies(data);
        }
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
        if (active) {
          setLoadingReplies(false);
        }
      });

    return () => {
      active = false;
    };
  }, [request.backendId]);

  // ========================================
  // SAVE MAINTENANCE STATUS
  // ========================================

  async function saveStatus() {
    if (savingLock.current) return;

    if (request.backendId === undefined) {
      setError(
        'This request is not connected to the database.'
      );
      return;
    }

    if (status === statusToBackend[request.status]) {
      return;
    }

    savingLock.current = true;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateMaintenanceStatus(
        request.backendId,
        status
      );

      onStatusUpdated(
        updated.id,
        updated.status as MaintenanceStatus
      );

      setSuccess(
        'Request status updated successfully.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update request status.'
      );
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  }

  // ========================================
  // SEND CONVERSATION REPLY
  // ========================================

  async function handleSendReply() {
    if (sendingReplyLock.current) return;

    if (request.backendId === undefined) {
      setReplyError(
        'This request is not connected to the database.'
      );
      return;
    }

    const message = replyText.trim();

    if (!message) {
      setReplyError('Please enter a reply.');
      return;
    }

    sendingReplyLock.current = true;
    setSendingReply(true);
    setReplyError('');
    setReplySuccess('');

    try {
      const newReply = await sendSupportReply(
        request.backendId,
        message
      );

      setReplies(current => [...current, newReply]);
      setReplyText('');
      setReplySuccess('Reply sent successfully.');
    } catch (err) {
      setReplyError(
        err instanceof Error
          ? err.message
          : 'Unable to send reply.'
      );
    } finally {
      sendingReplyLock.current = false;
      setSendingReply(false);
    }
  }

  // ========================================
  // SCREEN
  // ========================================

  return (
    <View style={styles.container}>

      {/* Request title */}

      <Text
        accessibilityRole="header"
        style={s.sectionTitle}
      >
        {request.title}
      </Text>

      {/* Maintenance category */}

      <Text style={styles.category}>
        {request.category || request.detail}
      </Text>

      {/* Request information */}

      <View style={styles.info}>

        <Text style={styles.label}>
          Request ID
        </Text>

        <Text style={styles.value}>
          {request.id}
        </Text>

        <Text style={styles.label}>
          Submitted by
        </Text>

        <Text style={styles.value}>
          {request.senderName ||
            (request.senderId !== undefined
              ? `Resident #${request.senderId}`
              : 'Resident')}
        </Text>

        <Text style={styles.label}>
          Unit
        </Text>

        <Text style={styles.value}>
          {request.unit}
        </Text>

        {request.createdAt && (
          <>
            <Text style={styles.label}>
              Date submitted
            </Text>

            <Text style={styles.value}>
              {new Date(
                request.createdAt
              ).toLocaleDateString()}
            </Text>
          </>
        )}

        <Text style={styles.label}>
          Current status
        </Text>

        <Text style={styles.status}>
          {request.status}
        </Text>

      </View>

      {/* Original resident description */}

      <Text style={styles.heading}>
        Description
      </Text>

      <Text style={styles.description}>
        {request.description || request.detail}
      </Text>

      {/* Attached maintenance photo */}

      {!!request.photo && (
        <>
          <Text style={styles.heading}>
            Attached photo
          </Text>

          <Image
            source={{ uri: request.photo }}
            accessibilityLabel="Maintenance request photo"
            style={styles.photo}
            resizeMode="contain"
          />
        </>
      )}

      <View style={styles.divider} />

      {/* ========================================
          UPDATE REQUEST STATUS
          ======================================== */}

      <Text style={styles.heading}>
        Update request status
      </Text>

      <Text style={styles.helpText}>
        Select a status, then save your changes.
      </Text>

      {statusOptions.map(option => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{
            checked: status === option.value,
            disabled: saving,
          }}
          disabled={saving}
          onPress={() => {
            setStatus(option.value);
            setError('');
            setSuccess('');
          }}
          style={[
            styles.statusOption,
            status === option.value &&
              styles.selectedOption,
          ]}
        >
          <View
            style={[
              styles.radio,
              status === option.value &&
                styles.selectedRadio,
            ]}
          >
            {status === option.value && (
              <View style={styles.radioCenter} />
            )}
          </View>

          <Text style={styles.optionText}>
            {option.label}
          </Text>
        </Pressable>
      ))}

      {!!error && (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {error}
        </Text>
      )}

      {!!success && (
        <Text
          accessibilityRole="alert"
          style={styles.success}
        >
          {success}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={
          saving ||
          request.backendId === undefined ||
          status === statusToBackend[request.status]
        }
        onPress={saveStatus}
        style={[
          styles.saveButton,
          (
            saving ||
            request.backendId === undefined ||
            status === statusToBackend[request.status]
          ) && styles.disabledButton,
        ]}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveText}>
            Save Status
          </Text>
        )}
      </Pressable>

      <View style={styles.divider} />

      {/* ========================================
          CONVERSATION
          ======================================== */}

      <Text style={styles.heading}>
        Conversation
      </Text>

      <Text style={styles.helpText}>
        Read and reply to messages about this maintenance request.
      </Text>

      {/* Original request appears first */}

      <View style={styles.conversationList}>

        <View
          style={[
            styles.messageBubble,
            styles.residentBubble,
          ]}
        >
          <Text style={styles.messageSender}>
            {request.senderName || 'Resident'}
          </Text>

          <Text style={styles.messageText}>
            {request.description || request.detail}
          </Text>

          {request.createdAt && (
            <Text style={styles.messageDate}>
              {new Date(
                request.createdAt
              ).toLocaleString()}
            </Text>
          )}
        </View>

        {loadingReplies ? (
          <ActivityIndicator color="#627FE5" />
        ) : (
          replies.map(reply => {
            const isManagerReply =
              reply.sender_id !== request.senderId;

            return (
              <View
                key={reply.id}
                style={[
                  styles.messageBubble,
                  isManagerReply
                    ? styles.managerBubble
                    : styles.residentBubble,
                ]}
              >
                <Text style={styles.messageSender}>
                  {reply.sender_name ||
                    (isManagerReply
                      ? 'Property Manager'
                      : 'Resident')}
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
            );
          })
        )}

      </View>

      {!!replyError && (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {replyError}
        </Text>
      )}

      {!!replySuccess && (
        <Text
          accessibilityRole="alert"
          style={styles.success}
        >
          {replySuccess}
        </Text>
      )}

      {/* Reply input */}

      <TextInput
        accessibilityLabel="Reply to resident"
        placeholder="Write a reply to the resident..."
        placeholderTextColor="#999999"
        multiline
        maxLength={10000}
        value={replyText}
        onChangeText={setReplyText}
        editable={
          !sendingReply &&
          request.backendId !== undefined
        }
        style={styles.replyInput}
      />

      {/* Send reply button */}

      <Pressable
        accessibilityRole="button"
        disabled={
          sendingReply ||
          !replyText.trim() ||
          request.backendId === undefined
        }
        onPress={handleSendReply}
        style={[
          styles.saveButton,
          (
            sendingReply ||
            !replyText.trim() ||
            request.backendId === undefined
          ) && styles.disabledButton,
        ]}
      >
        {sendingReply ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveText}>
            Send Reply
          </Text>
        )}
      </Pressable>

    </View>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  container: {
    gap: 14,
    paddingBottom: 16,
  },

  category: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEEFF',
    color: '#5366BC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600',
  },

  info: {
    backgroundColor: '#F5F6FC',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
    marginTop: 6,
  },

  value: {
    color: '#242630',
    fontSize: 15,
    fontWeight: '500',
  },

  status: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEEFF',
    color: '#5366BC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600',
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242630',
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#454550',
  },

  photo: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#F5F6FC',
  },

  divider: {
    height: 1,
    backgroundColor: '#E4E6F0',
    marginVertical: 6,
  },

  helpText: {
    color: '#777777',
    fontSize: 13,
  },

  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  selectedOption: {
    borderColor: '#627FE5',
    backgroundColor: '#EDEEFF',
  },

  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999999',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRadio: {
    borderColor: '#627FE5',
  },

  radioCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#627FE5',
  },

  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#242630',
  },

  saveButton: {
    backgroundColor: '#627FE5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  error: {
    color: '#B74343',
    backgroundColor: '#FCEEEE',
    padding: 12,
    borderRadius: 10,
  },

  success: {
    color: '#31845B',
    backgroundColor: '#EAF6EE',
    padding: 12,
    borderRadius: 10,
  },

  // Conversation styles

  conversationList: {
    gap: 12,
  },

  messageBubble: {
    padding: 14,
    borderRadius: 12,
    maxWidth: '90%',
    gap: 6,
  },

  managerBubble: {
    backgroundColor: '#EDEEFF',
    alignSelf: 'flex-end',
  },

  residentBubble: {
    backgroundColor: '#F5F6FC',
    alignSelf: 'flex-start',
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

  replyInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    fontSize: 14,
    color: '#242630',
    textAlignVertical: 'top',
  },

});
