
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import RoomiePet from '../../components/RoomiePet';
import SupportRecipient from '../../components/profile/SupportRecipient';
import { randomUUID } from '../../utils/randomUUID';
import type { ResidentData } from '../../hooks/useResidentData';
import { createSupportRequest } from '../../services/api';

import './MaintenanceScreen.css';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

type ContactRAScreenProps = {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError: string;
  onBack: () => void;
  initialCategory?: string;
};

export default function ContactRAScreen({
  setData,
  storageError,
  onBack,
  initialCategory = 'General support',
}: ContactRAScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submissionLock = useRef(false);
  const category = initialCategory;

  // Send the message to the assigned RA through the backend.
  async function sendMessage() {
    if (submissionLock.current) return;

    setSaved(false);
    setSubmitted(false);
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Enter a subject and description.');
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    try {
      await createSupportRequest({
        request_type: 'ra_message',
        category,
        subject: title.trim(),
        description: description.trim(),
        photo: null,
      });

      setTitle('');
      setDescription('');
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to send your message.'
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  // Save the message locally without sending it to the RA.
  function save() {
    if (submissionLock.current) return;

    setSubmitted(false);
    setError('');

    if (!title.trim() || !description.trim()) {
      setError(
        'Enter a subject and describe the support you need.'
      );
      return;
    }

    setData(previous => ({
      ...previous,
      supportDrafts: [
        ...(previous.supportDrafts || []),
        {
          id: randomUUID(),
          kind: 'ra',
          title: title.trim(),
          description: description.trim(),
          category,
          location: previous.household,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setTitle('');
    setDescription('');
    setSaved(true);
  }

  return (
    <>
      {/* Back button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to profile"
        onPress={onBack}
        disabled={submitting}
        style={s.backArrow}
      >
        <Text style={s.backArrowText}>{'<'}</Text>
      </Pressable>

      {/* Mascot and heading */}
      <View style={s.header}>
        {Platform.OS === 'web' ? (
          <div
            key={
              submitted || (saved && !storageError)
                ? 'saved'
                : 'ready'
            }
            className="maintenance-mascot"
          >
            <RoomiePet role="assistant" size={95} />
          </div>
        ) : (
          <RoomiePet role="assistant" size={95} />
        )}

        <View style={s.copy}>
          <Text
            accessibilityRole="header"
            style={s.title}
          >
            {submitted
              ? 'Message sent, Roomie!'
              : saved && !storageError
                ? 'Draft saved, Roomie!'
                : 'Hey, Roomie!'}
          </Text>

          <Text style={s.subtitle}>
            {submitted
              ? 'Your message has been sent to your RA.'
              : saved && !storageError
                ? 'Your support request is saved.'
                : "Let's talk about what's happening."}
          </Text>
        </View>
      </View>

      {/* RA message form */}
      <View style={s.form}>
        {/* Assigned resident assistant */}
        <SupportRecipient kind="ra" />

        {/* Selected category */}
        <Text
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#EDEEFF',
            color: '#5366BC',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 9,
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          {category}
        </Text>

        {/* Subject */}
        <Text style={s.label}>Subject</Text>

        <TextInput
          accessibilityLabel="RA request subject"
          value={title}
          editable={!submitting}
          maxLength={200}
          onChangeText={value => {
            setTitle(value);
            setSaved(false);
            setSubmitted(false);
          }}
          placeholder="What would you like help with?"
          style={s.input}
        />

        {/* Description */}
        <Text style={s.label}>Description</Text>

        <TextInput
          accessibilityLabel="RA request description"
          multiline
          value={description}
          editable={!submitting}
          maxLength={10000}
          onChangeText={value => {
            setDescription(value);
            setSaved(false);
            setSubmitted(false);
          }}
          placeholder="Tell your RA what's happening and how they can help."
          style={[s.input, s.description]}
        />

        {/* Error messages */}
        {!!error && (
          <Text
            accessibilityRole="alert"
            style={s.error}
          >
            {error}
          </Text>
        )}

        {!!storageError && (
          <Text
            accessibilityRole="alert"
            style={s.error}
          >
            {storageError}
          </Text>
        )}

        {/* Draft saved confirmation */}
        {saved && !storageError && (
          <Text
            accessibilityLiveRegion="polite"
            style={s.success}
          >
            Support request draft saved. It has not been
            sent to your RA.
          </Text>
        )}

        {/* Successful submission confirmation */}
        {submitted && (
          <Text
            accessibilityLiveRegion="polite"
            style={s.success}
          >
            Your message has been sent to your RA!
          </Text>
        )}

        {/* Send message button */}
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={sendMessage}
          style={({ pressed }) => [
            s.submit,
            (pressed || submitting) && s.pressed,
          ]}
        >
          <Text style={s.submitText}>
            {submitting ? 'Sending...' : 'Send message'}
          </Text>
        </Pressable>

        {/* Save as draft button */}
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={save}
          style={({ pressed }) => [
            s.submit,
            {
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#D5D9EF',
            },
            (pressed || submitting) && s.pressed,
          ]}
        >
          <Text
            style={[
              s.submitText,
              { color: '#5366BC' },
            ]}
          >
            Save as draft
          </Text>
        </Pressable>
      </View>
    </>
  );
}
