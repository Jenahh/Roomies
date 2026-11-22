
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import RoomiePet from '../../components/RoomiePet';
import SupportRecipient from '../../components/profile/SupportRecipient';
import type { ResidentData } from '../../hooks/useResidentData';
import { createSupportRequest } from '../../services/api';
import { randomUUID } from '../../utils/randomUUID';

import './MaintenanceScreen.css';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

type MaintenanceScreenProps = {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError: string;
  onBack: () => void;
  initialCategory?: string;
};

export default function MaintenanceScreen({
  setData,
  storageError,
  onBack,
  initialCategory = 'Plumbing',
}: MaintenanceScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const submissionLock = useRef(false);
  const category = initialCategory;

  const examples: Record<string, string> = {
    Plumbing: 'e.g. Kitchen faucet is dripping',
    Electrical: 'e.g. Bedroom light is not working',
    'Heating & cooling': 'e.g. AC is not cooling',
    Appliances: 'e.g. Refrigerator is not working',
    'Doors & locks': 'e.g. Front door lock is stuck',
    'General repair': 'e.g. Kitchen cabinet is broken',
  };

  const titlePlaceholder =
    examples[category] || 'Briefly describe the issue';

  function clearPhoto() {
    setPhoto('');
    setPhotoName('');

    if (fileInput.current) {
      fileInput.current.value = '';
    }
  }

  // Submit the maintenance request to the backend.
  async function submitRequest() {
    if (submissionLock.current || loadingPhoto) return;

    setSaved(false);
    setSubmitted(false);
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Enter an issue title and description.');
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    try {
      await createSupportRequest({
        request_type: 'maintenance',
        category,
        subject: title.trim(),
        description: description.trim(),
        photo: photo || null,
      });

      setTitle('');
      setDescription('');
      clearPhoto();
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to submit your request.'
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  // Save the request locally as a draft.
  function save() {
    if (submissionLock.current || loadingPhoto) return;

    setSubmitted(false);
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Enter an issue title and description.');
      return;
    }

    setData(previous => ({
      ...previous,
      supportDrafts: [
        ...(previous.supportDrafts || []),
        {
          id: randomUUID(),
          kind: 'maintenance',
          title: title.trim(),
          description: description.trim(),
          category,
          photo: photo || undefined,
          location: previous.household,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setTitle('');
    setDescription('');
    clearPhoto();
    setSaved(true);
  }

  // Read and validate an optional photo attachment on web.
  function choosePhoto(file?: File) {
    if (!file || submissionLock.current) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !allowedTypes.includes(file.type) ||
      file.size === 0 ||
      file.size > 1024 * 1024
    ) {
      setError('Choose a JPG, PNG, or WebP photo up to 1 MB.');

      if (fileInput.current) {
        fileInput.current.value = '';
      }

      return;
    }

    setLoadingPhoto(true);
    setError('');
    setSaved(false);
    setSubmitted(false);

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result));
      setPhotoName(file.name);
      setLoadingPhoto(false);
    };

    reader.onerror = () => {
      setError('This photo could not be read. Try another file.');
      setLoadingPhoto(false);
    };

    reader.readAsDataURL(file);
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
            <RoomiePet role="property-manager" size={95} />
          </div>
        ) : (
          <RoomiePet role="property-manager" size={95} />
        )}

        <View style={s.copy}>
          <Text accessibilityRole="header" style={s.title}>
            {submitted
              ? 'Request sent, Roomie!'
              : saved && !storageError
                ? 'All done, Roomie!'
                : "Let's get that fixed!"}
          </Text>

          <Text style={s.subtitle}>
            {submitted
              ? 'Your property manager has received your request.'
              : saved && !storageError
                ? 'Your request draft is saved.'
                : "Tell me a little more about what's happening."}
          </Text>
        </View>
      </View>

      {/* Maintenance request form */}
      <View style={s.form}>
        <SupportRecipient kind="maintenance" />

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

        <Text style={s.label}>Issue title</Text>

        <TextInput
          accessibilityLabel="Issue title"
          value={title}
          editable={!submitting}
          maxLength={200}
          onChangeText={value => {
            setTitle(value);
            setSaved(false);
            setSubmitted(false);
          }}
          placeholder={titlePlaceholder}
          style={s.input}
        />

        <Text style={s.label}>Description</Text>

        <TextInput
          accessibilityLabel="Issue description"
          multiline
          value={description}
          editable={!submitting}
          maxLength={10000}
          onChangeText={value => {
            setDescription(value);
            setSaved(false);
            setSubmitted(false);
          }}
          placeholder="Describe the issue, where it is, and when it started."
          style={[s.input, s.description]}
        />

        {/* Photo upload is currently available on web. */}
        {Platform.OS === 'web' && (
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Attach maintenance photo"
            disabled={submitting || loadingPhoto}
            style={{ display: 'none' }}
            onChange={event =>
              choosePhoto(event.target.files?.[0])
            }
          />
        )}

        {Platform.OS === 'web' && (
          <Pressable
            accessibilityRole="button"
            disabled={loadingPhoto || submitting}
            onPress={() => fileInput.current?.click()}
            style={s.photoButton}
          >
            <Text style={s.photoText}>
              {loadingPhoto
                ? 'Loading photo...'
                : photo
                  ? 'Change photo'
                  : '+ Add a photo'}{' '}
              <Text style={s.subtitle}>Optional</Text>
            </Text>
          </Pressable>
        )}

        {!!photo && (
          <View style={s.photoCard}>
            <Image
              source={{ uri: photo }}
              style={s.photo}
              resizeMode="contain"
              accessibilityLabel="Attached maintenance photo"
            />

            <Text style={s.subtitle}>{photoName}</Text>

            <Pressable
              accessibilityRole="button"
              disabled={loadingPhoto || submitting}
              onPress={clearPhoto}
              style={s.back}
            >
              <Text style={s.link}>Remove photo</Text>
            </Pressable>
          </View>
        )}

        {!!error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}

        {!!storageError && (
          <Text accessibilityRole="alert" style={s.error}>
            {storageError}
          </Text>
        )}

        {saved && !storageError && (
          <Text
            accessibilityLiveRegion="polite"
            style={s.success}
          >
            Request draft saved on this device.
            Not sent to property management.
          </Text>
        )}

        {submitted && (
          <Text
            accessibilityLiveRegion="polite"
            style={s.success}
          >
            Your request has been sent to your property manager!
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={loadingPhoto || submitting}
          onPress={submitRequest}
          style={({ pressed }) => [
            s.submit,
            (pressed || loadingPhoto || submitting) && s.pressed,
          ]}
        >
          <Text style={s.submitText}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={loadingPhoto || submitting}
          onPress={save}
          style={({ pressed }) => [
            s.submit,
            {
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#D5D9EF',
            },
            (pressed || loadingPhoto || submitting) && s.pressed,
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
