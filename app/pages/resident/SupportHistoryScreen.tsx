import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { History, Wrench, MessageCircle, ChevronRight } from 'lucide-react';
import RoomiePet from '../../components/RoomiePet';
import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ProfileScreen.styles';
import {
  createSupportRequest, getSupportRequests, getSupportReplies, sendSupportReply,
  type SupportRequestResponse, type SupportReply,
} from '../../services/api';
import './SupportHistoryScreen.css';

type Props = {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError?: string;
  kind: 'maintenance' | 'ra';
  onBack: () => void;
};
const statusLabels: Record<string, string> = {
  submitted: 'Submitted', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};
function formatStatus(status: string): string { return statusLabels[status] || status; }

export default function SupportHistoryScreen({ data, setData, storageError, kind, onBack }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [submittedRequests, setSubmittedRequests] = useState<SupportRequestResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const sendingReplyLock = useRef(false);
  const maintenance = kind === 'maintenance';
  const Icon = maintenance ? Wrench : MessageCircle;
  const drafts = [...(data.supportDrafts || [])].filter(x => x.kind === kind)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const requests = submittedRequests.filter(request => request.request_type ===
    (maintenance ? 'maintenance' : 'ra_message')).sort((a,b) => b.created_at.localeCompare(a.created_at));
  const selectedDraft = id?.startsWith('draft:') ? drafts.find(x => x.id === id.slice(6)) : undefined;
  const selectedRequest = id?.startsWith('request:') ? requests.find(x => x.id === Number(id.slice(8))) : undefined;
  async function refreshRequests() {
    setRefreshing(true); setRequestsError('');
    try { setSubmittedRequests(await getSupportRequests()); }
    catch (err) { setRequestsError(err instanceof Error ? err.message : 'Unable to load submitted requests.'); }
    finally { setLoadingRequests(false); setRefreshing(false); }
  }
  useEffect(() => {
    let active = true;
    setLoadingRequests(true); setRequestsError('');
    getSupportRequests().then(result => { if (active) setSubmittedRequests(result); })
      .catch(err => { if (active) setRequestsError(err instanceof Error ? err.message : 'Unable to load submitted requests.'); })
      .finally(() => { if (active) setLoadingRequests(false); });
    return () => { active = false; };
  }, [kind]);
  useEffect(() => {
    let active = true;
    setReplies([]); setReplyText(''); setReplyError('');
    if (!selectedRequest) { setLoadingReplies(false); return; }
    setLoadingReplies(true);
    getSupportReplies(selectedRequest.id).then(result => { if (active) setReplies(result); })
      .catch(err => { if (active) setReplyError(err instanceof Error ? err.message : 'Unable to load conversation.'); })
      .finally(() => { if (active) setLoadingReplies(false); });
    return () => { active = false; };
  }, [selectedRequest?.id]);
  function reset() { setEditing(false); setConfirm(false); setNotice(''); setError(''); }
  function goBack() {
    if (id !== null) { setId(null); reset(); setReplyError(''); setReplyText(''); void refreshRequests(); }
    else onBack();
  }
  function save() {
    if (!selectedDraft || submissionLock.current) return;
    if (!title.trim() || !description.trim()) { setError('Please enter a title and description.'); return; }
    setData(previous => ({ ...previous, supportDrafts: (previous.supportDrafts || []).map(x =>
      x.id === selectedDraft.id && x.kind === kind ? { ...x, title: title.trim(), description: description.trim() } : x) }));
    setEditing(false); setError(''); setNotice('Changes updated.');
  }
  function remove() {
    if (!selectedDraft || submissionLock.current) return;
    setData(previous => ({ ...previous, supportDrafts: (previous.supportDrafts || []).filter(x =>
      !(x.id === selectedDraft.id && x.kind === kind)) }));
    setId(null); reset();
  }


  // ========================================
  // SUBMIT DRAFT TO BACKEND
  // ========================================

  async function submitDraft() {
    if (!selectedDraft || submissionLock.current) return;

    if (
      !selectedDraft.title.trim() ||
      !selectedDraft.description.trim()
    ) {
      setError('Please enter a title and description.');
      return;
    }

    submissionLock.current = true;

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      await createSupportRequest({
        request_type: maintenance
          ? 'maintenance'
          : 'ra_message',

        category: selectedDraft.category || 'Other',

        subject: selectedDraft.title.trim(),

        description: selectedDraft.description.trim(),

        photo: maintenance
          ? selectedDraft.photo || null
          : null,
      });

      // Remove the draft only after a successful submission.
      setData(previous => ({
        ...previous,

        supportDrafts: (previous.supportDrafts || [])
          .filter(x =>
            !(x.id === selectedDraft.id && x.kind === kind)
          ),
      }));

      setId(null);
      setEditing(false);
      setConfirm(false);

      setNotice(
        maintenance
          ? 'Your request has been sent to your property manager!'
          : 'Your message has been sent to your RA!'
      );

      await refreshRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your request.'
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  // ========================================
  // SEND REPLY TO STAFF
  // ========================================

  async function handleSendReply() {
    if (!selectedRequest || sendingReplyLock.current) {
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

    try {
      const newReply = await sendSupportReply(
        selectedRequest.id,
        message
      );

      setReplies(current => [...current, newReply]);
      setReplyText('');
      setNotice('Reply sent successfully.');
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


  if (Platform.OS !== 'web') {
    const action = (label: string, onPress: () => void, disabled = false) => (
      <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={s.edit}>
        <Text style={s.link}>{label}</Text>
      </Pressable>
    );
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {action(id !== null ? 'Back to history' : 'Back to profile', goBack, submitting || sendingReply)}
        <Text accessibilityRole="header" style={s.title}>{maintenance ? 'Request history' : 'Message history'}</Text>
        {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {!!requestsError && <Text accessibilityRole="alert" style={s.error}>{requestsError}</Text>}
        {!!notice && <Text style={s.subtitle}>{notice}</Text>}
        {selectedDraft ? (
          <View style={s.card}>
            <Text style={s.subtitle}>Draft · Not sent</Text>
            <Text style={s.subtitle}>{selectedDraft.category || 'Other'} · {new Date(selectedDraft.createdAt).toLocaleDateString()}</Text>
            {editing ? (
              <>
                <Text style={s.label}>{maintenance ? 'Issue title' : 'Subject'}</Text>
                <TextInput accessibilityLabel="Draft title" value={title} onChangeText={setTitle} style={s.input} maxLength={200}/>
                <Text style={s.label}>Description</Text>
                <TextInput accessibilityLabel="Draft description" multiline value={description} onChangeText={setDescription} style={s.input} maxLength={10000}/>
                {action('Save changes', save)}
                {action('Cancel', reset)}
              </>
            ) : (
              <>
                <Text style={s.sectionTitle}>{selectedDraft.title}</Text>
                <Text style={s.subtitle}>{selectedDraft.description}</Text>
                {!!selectedDraft.photo && <Image source={{ uri: selectedDraft.photo }} style={{ height: 160 }} resizeMode="contain"/>}
                {confirm ? (
                  <>
                    <Text style={s.label}>Delete this draft?</Text>
                    {action('Confirm deletion', remove)}
                    {action('Cancel', reset)}
                  </>
                ) : (
                  <>
                    {action(submitting ? 'Sending...' : maintenance ? 'Submit request' : 'Send message', () => { void submitDraft(); }, submitting)}
                    {action('Edit draft', () => { setTitle(selectedDraft.title); setDescription(selectedDraft.description); reset(); setEditing(true); }, submitting)}
                    {action('Delete draft', () => { setNotice(''); setConfirm(true); }, submitting)}
                  </>
                )}
              </>
            )}
          </View>
        ) : selectedRequest ? (
          <View style={s.card}>
            <Text style={s.subtitle}>{formatStatus(selectedRequest.status)}</Text>
            <Text style={s.sectionTitle}>{selectedRequest.subject}</Text>
            <Text style={s.subtitle}>{selectedRequest.category || 'Other'} · {new Date(selectedRequest.created_at).toLocaleDateString()}</Text>
            <Text style={s.subtitle}>{selectedRequest.description}</Text>
            {!!selectedRequest.photo && <Image source={{ uri: selectedRequest.photo }} style={{ height: 160 }} resizeMode="contain"/>}
            <Text style={s.sectionTitle}>Conversation</Text>
            <Text style={s.subtitle}>You: {selectedRequest.description}</Text>
            {loadingReplies && <Text style={s.subtitle}>Loading conversation...</Text>}
            {replies.map(reply => (
              <View key={reply.id} style={s.input}>
                <Text style={s.label}>{reply.sender_id === selectedRequest.sender_id ? 'You' : reply.sender_name || 'Staff'}</Text>
                <Text>{reply.message}</Text>
                <Text style={s.subtitle}>{new Date(reply.created_at).toLocaleString()}</Text>
              </View>
            ))}
            {!!replyError && <Text accessibilityRole="alert" style={s.error}>{replyError}</Text>}
            <TextInput accessibilityLabel="Write a reply" placeholder="Write a reply..." multiline value={replyText} onChangeText={setReplyText} style={s.input} maxLength={10000} editable={!sendingReply}/>
            {action(sendingReply ? 'Sending...' : 'Send reply', () => { void handleSendReply(); }, sendingReply || !replyText.trim())}
            {action('Refresh conversation', () => {
              setLoadingReplies(true);
              getSupportReplies(selectedRequest.id).then(setReplies)
                .catch(err => setReplyError(err instanceof Error ? err.message : 'Unable to refresh conversation.'))
                .finally(() => setLoadingReplies(false));
              void refreshRequests();
            }, loadingReplies || sendingReply)}
          </View>
        ) : (
          <View style={s.card}>
            {action(refreshing ? 'Refreshing...' : 'Refresh history', () => { void refreshRequests(); }, refreshing)}
            {loadingRequests && <Text style={s.subtitle}>Loading requests...</Text>}
            {!loadingRequests && requests.length === 0 && drafts.length === 0 && <Text style={s.subtitle}>No requests yet.</Text>}
            {requests.map(item => (
              <Pressable key={`request-${item.id}`} accessibilityRole="button" style={s.input} onPress={() => { reset(); setId(`request:${item.id}`); }}>
                <Text style={s.sectionTitle}>{item.subject}</Text>
                <Text numberOfLines={2} style={s.subtitle}>{item.description}</Text>
                <Text style={s.subtitle}>{formatStatus(item.status)} · {new Date(item.created_at).toLocaleDateString()}</Text>
              </Pressable>
            ))}
            {drafts.map(item => (
              <Pressable key={`draft-${item.id}`} accessibilityRole="button" style={s.input} onPress={() => { reset(); setId(`draft:${item.id}`); }}>
                <Text style={s.sectionTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={s.subtitle}>{item.description}</Text>
                <Text style={s.subtitle}>Draft · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <section className="support-history">

      {/* Back button */}

      <button
        className="history-back"
        disabled={submitting || sendingReply}
        onClick={goBack}
      >
        {'‹'} {id !== null
          ? 'Back to history'
          : 'Back to profile'}
      </button>

      {/* Header */}

      <div className="history-header">
        <RoomiePet
          role={
            maintenance
              ? 'property-manager'
              : 'assistant'
          }
          color={data.pet?.color}
          size={85}
        />

        <div>
          <h2>
            {maintenance
              ? 'Request history'
              : 'Message history'}
          </h2>

          <p>
            {maintenance
              ? 'View your maintenance requests and saved drafts.'
              : 'View your RA messages and saved drafts.'}
          </p>
        </div>
      </div>

      {/* Error messages */}

      {storageError && (
        <p role="alert" className="history-error">
          {storageError}
        </p>
      )}

      {error && (
        <p role="alert" className="history-error">
          {error}
        </p>
      )}

      {requestsError && (
        <p role="alert" className="history-error">
          {requestsError}
        </p>
      )}

      {notice && !storageError && (
        <p
          role="status"
          className="history-meta"
          style={{
            color: '#31845B',
            backgroundColor: '#EAF6EE',
            padding: 12,
            borderRadius: 10,
          }}
        >
          {notice}
        </p>
      )}

      {/* ========================================
          SELECTED DRAFT
          ======================================== */}

      {selectedDraft ? (

        <div className="history-details">

          <span className="history-status">
            Draft · Not sent
          </span>

          <p className="history-meta">
            {selectedDraft.category || 'Other'}
            {' · '}
            {new Date(
              selectedDraft.createdAt
            ).toLocaleDateString()}
          </p>

          {editing ? (
            <>
              <label htmlFor="draft-title">
                {maintenance ? 'Issue title' : 'Subject'}
              </label>

              <input
                id="draft-title"
                value={title}
                maxLength={200}
                onChange={e =>
                  setTitle(e.target.value)
                }
              />

              <label htmlFor="draft-description">
                Description
              </label>

              <textarea
                id="draft-description"
                rows={5}
                maxLength={10000}
                value={description}
                onChange={e =>
                  setDescription(e.target.value)
                }
              />

              <button
                className="history-primary"
                onClick={save}
              >
                Save changes
              </button>

              <button
                className="history-secondary"
                onClick={reset}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h2>{selectedDraft.title}</h2>

              <p className="history-description">
                {selectedDraft.description}
              </p>

              {selectedDraft.photo && (
                <img
                  className="history-photo"
                  src={selectedDraft.photo}
                  alt="Attached maintenance photo"
                />
              )}

              {!confirm ? (
                <>
                  <button
                    className="history-primary"
                    onClick={submitDraft}
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Sending...'
                      : maintenance
                        ? 'Submit request'
                        : 'Send message'}
                  </button>

                  <button
                    className="history-secondary"
                    disabled={submitting}
                    onClick={() => {
                      setTitle(selectedDraft.title);
                      setDescription(
                        selectedDraft.description
                      );

                      reset();
                      setEditing(true);
                    }}
                  >
                    Edit draft
                  </button>

                  <button
                    className="history-delete"
                    disabled={submitting}
                    onClick={() => {
                      setNotice('');
                      setError('');
                      setConfirm(true);
                    }}
                  >
                    Delete draft
                  </button>
                </>
              ) : (
                <div className="history-confirm">
                  <strong>Delete this draft?</strong>
                  <p>This cannot be undone.</p>

                  <button
                    className="history-delete"
                    onClick={remove}
                  >
                    Confirm deletion
                  </button>

                  <button
                    className="history-secondary"
                    onClick={reset}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      ) : selectedRequest ? (

        /* ========================================
           SELECTED SUBMITTED REQUEST
           ======================================== */

        <div className="history-details">

          <span className="history-status">
            {formatStatus(selectedRequest.status)}
          </span>

          <p className="history-meta">
            {selectedRequest.category || 'Other'}
            {' · '}
            {new Date(
              selectedRequest.created_at
            ).toLocaleDateString()}
          </p>

          <h2>{selectedRequest.subject}</h2>

          <p className="history-meta">
            {maintenance
              ? `Property Manager: ${
                  selectedRequest.recipient_name ||
                  'Property Manager'
                }`
              : `Resident Assistant: ${
                  selectedRequest.recipient_name ||
                  'RA'
                }`}
          </p>

          <p className="history-meta">
            Request #{selectedRequest.id}
          </p>

          <h3>Description</h3>

          <p className="history-description">
            {selectedRequest.description}
          </p>

          {selectedRequest.photo && (
            <img
              className="history-photo"
              src={selectedRequest.photo}
              alt="Attached maintenance photo"
            />
          )}

          <hr
            style={{
              border: 0,
              borderTop: '1px solid #E4E6F0',
              margin: '20px 0',
            }}
          />

          {/* Conversation */}

          <h3>Conversation</h3>

          <p className="history-meta">
            Messages between you and{' '}
            {maintenance
              ? 'your Property Manager'
              : 'your Resident Assistant'}.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 14,
              marginBottom: 20,
            }}
          >

            {/* Original request */}

            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '90%',
                padding: 14,
                borderRadius: 12,
                backgroundColor: '#EDEEFF',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: '#5366BC',
                  marginBottom: 6,
                }}
              >
                You
              </strong>

              <p
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {selectedRequest.description}
              </p>

              <small
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: '#777777',
                }}
              >
                {new Date(
                  selectedRequest.created_at
                ).toLocaleString()}
              </small>
            </div>

            {loadingReplies ? (
              <p className="history-meta">
                Loading conversation...
              </p>
            ) : (
              replies.map(reply => {
                const isResident =
                  reply.sender_id ===
                  selectedRequest.sender_id;

                return (
                  <div
                    key={reply.id}
                    style={{
                      alignSelf: isResident
                        ? 'flex-end'
                        : 'flex-start',
                      maxWidth: '90%',
                      padding: 14,
                      borderRadius: 12,
                      backgroundColor: isResident
                        ? '#EDEEFF'
                        : '#F5F6FC',
                    }}
                  >
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#5366BC',
                        marginBottom: 6,
                      }}
                    >
                      {isResident
                        ? 'You'
                        : reply.sender_name ||
                          (maintenance
                            ? 'Property Manager'
                            : 'Resident Assistant')}
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {reply.message}
                    </p>

                    <small
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: '#777777',
                      }}
                    >
                      {new Date(
                        reply.created_at
                      ).toLocaleString()}
                    </small>
                  </div>
                );
              })
            )}
          </div>

          {replyError && (
            <p
              role="alert"
              className="history-error"
            >
              {replyError}
            </p>
          )}

          <label htmlFor="resident-reply">
            Write a reply
          </label>

          <textarea
            id="resident-reply"
            rows={4}
            maxLength={10000}
            value={replyText}
            placeholder={
              maintenance
                ? 'Reply to your Property Manager...'
                : 'Reply to your Resident Assistant...'
            }
            disabled={sendingReply}
            onChange={e =>
              setReplyText(e.target.value)
            }
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 12,
              border: '1px solid #E4E6F0',
              padding: 14,
              fontFamily: 'inherit',
              fontSize: 14,
              marginTop: 8,
              marginBottom: 12,
            }}
          />

          <button
            className="history-primary"
            onClick={handleSendReply}
            disabled={
              sendingReply || !replyText.trim()
            }
          >
            {sendingReply
              ? 'Sending...'
              : 'Send Reply'}
          </button>

          <button
            className="history-secondary"
            disabled={sendingReply || loadingReplies}
            onClick={async () => {
              setReplyError('');

              try {
                setLoadingReplies(true);

                const updated = await getSupportReplies(
                  selectedRequest.id
                );

                setReplies(updated);
                await refreshRequests();
              } catch (err) {
                setReplyError(
                  err instanceof Error
                    ? err.message
                    : 'Unable to refresh conversation.'
                );
              } finally {
                setLoadingReplies(false);
              }
            }}
          >
            Refresh conversation
          </button>

        </div>

      ) : (

        /* ========================================
           REQUEST HISTORY LIST
           ======================================== */

        <>
          <button
            className="history-secondary"
            disabled={refreshing}
            onClick={refreshRequests}
            style={{ marginBottom: 16 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh history'}
          </button>

          {loadingRequests ? (
            <div className="history-empty">
              <History size={26} />
              <h3>Loading requests...</h3>
            </div>
          ) : requests.length === 0 &&
            drafts.length === 0 ? (
            <div className="history-empty">
              <History size={26} />

              <h3>No requests yet</h3>

              <p>
                Your submitted requests and saved drafts
                will appear here.
              </p>
            </div>
          ) : (
            <div className="history-list">

              {/* Submitted requests */}

              {requests.map(item => (
                <button
                  key={`request-${item.id}`}
                  className="history-card"
                  onClick={() => {
                    reset();
                    setId(`request:${item.id}`);
                  }}
                >
                  <div className="history-icon">
                    <Icon size={22} />
                  </div>

                  <div className="history-card-copy">
                    <h3>{item.subject}</h3>

                    <p className="history-preview">
                      {item.description}
                    </p>

                    <p className="history-meta">
                      {item.category || 'Other'}
                      {' · '}
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </p>

                    <span className="history-status">
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>
              ))}

              {/* Saved drafts */}

              {drafts.map(item => (
                <button
                  key={`draft-${item.id}`}
                  className="history-card"
                  onClick={() => {
                    reset();
                    setId(`draft:${item.id}`);
                  }}
                >
                  <div className="history-icon">
                    <Icon size={22} />
                  </div>

                  <div className="history-card-copy">
                    <h3>{item.title}</h3>

                    <p className="history-preview">
                      {item.description}
                    </p>

                    <p className="history-meta">
                      {item.category || 'Other'}
                      {' · '}
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </p>

                    <span className="history-status">
                      Draft
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>
              ))}

            </div>
          )}
        </>
      )}

    </section>
  );
}
