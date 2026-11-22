
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import RoomiePet from '../../components/RoomiePet';
import SupportRecipient from '../../components/profile/SupportRecipient';
import { createSupportRequest } from '../../services/api';

import './MaintenanceScreen.css';
import { styles as s } from '../../styles/MaintenanceScreen.styles';


export default function MaintenanceScreen({
  setData,
  storageError,
  onBack,
  initialCategory = 'Plumbing',
}: {
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError: string;
  onBack: () => void;
  initialCategory?: string;
}) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const category = initialCategory;

  const examples: Record<string, string> = {
    'Plumbing': 'e.g. Kitchen faucet is dripping',
    'Electrical': 'e.g. Bedroom light is not working',
    'Heating & cooling': 'e.g. AC is not cooling',
    'Appliances': 'e.g. Refrigerator is not working',
    'Doors & locks': 'e.g. Front door lock is stuck',
    'General repair': 'e.g. Kitchen cabinet is broken',
  };

  const titlePlaceholder =
    examples[category] || 'Briefly describe the issue';

  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const submissionLock = useRef(false);


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
      setPhoto('');
      setPhotoName('');
      setSubmitted(true);

      if (fileInput.current) {
        fileInput.current.value = '';
      }

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

    if (!title.trim() || !description.trim()) {
      setError('Enter an issue title and description.');
      return;
    }

    setData(previous => ({
      ...previous,

      supportDrafts: [
        ...(previous.supportDrafts || []),

        {
          id: crypto.randomUUID(),
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
    setPhoto('');
    setPhotoName('');
    setError('');
    setSaved(true);

    if (fileInput.current) {
      fileInput.current.value = '';
    }
  }


  // Read and validate an optional photo attachment.

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
      setError(
        'Choose a JPG, PNG, or WebP photo up to 1 MB.'
      );

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

      setError(
        'This photo could not be read. Try another file.'
      );

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
        <Text style={s.backArrowText}>
          {'<'}
        </Text>
      </Pressable>


      {/* Mascot and heading */}

      <View style={s.header}>

        <div
          key={
            submitted || (saved && !storageError)
              ? 'saved'
              : 'ready'
          }
          className="maintenance-mascot"
        >
          <RoomiePet
            role="property-manager"
            size={95}
          />
        </div>

        <View style={s.copy}>

          <Text
            accessibilityRole="header"
            style={s.title}
          >
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

        {/* Assigned property manager */}

        <SupportRecipient kind="maintenance" />


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


        {/* Issue title */}

        <Text style={s.label}>
          Issue title
        </Text>

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


        {/* Description */}

        <Text style={s.label}>
          Description
        </Text>

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


        {/* Hidden photo file input */}

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


        {/* Add photo button */}

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
                : '+ Add a photo'}

            {' '}

            <Text style={s.subtitle}>
              Optional
            </Text>

          </Text>
        </Pressable>


        {/* Photo preview */}

        {!!photo && (

          <View style={s.photoCard}>

            <Image
              source={{ uri: photo }}
              style={s.photo}
              resizeMode="contain"
              accessibilityLabel="Attached maintenance photo"
            />

            <Text style={s.subtitle}>
              {photoName}
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={loadingPhoto || submitting}
              onPress={() => {

                setPhoto('');
                setPhotoName('');

                if (fileInput.current) {
                  fileInput.current.value = '';
                }

              }}
              style={s.back}
            >
              <Text style={s.link}>
                Remove photo
              </Text>
            </Pressable>

          </View>

        )}


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
            Request draft saved on this device.
            Not sent to property management.
          </Text>

        )}


        {/* Successful submission confirmation */}

        {submitted && (

          <Text
            accessibilityLiveRegion="polite"
            style={s.success}
          >
            Your request has been sent to your
            property manager!
          </Text>

        )}


        {/* Submit request button */}

        <Pressable
          accessibilityRole="button"
          disabled={loadingPhoto || submitting}
          onPress={submitRequest}
          style={({ pressed }) => [
            s.submit,
            (pressed || loadingPhoto || submitting)
              && s.pressed,
          ]}
        >

          <Text style={s.submitText}>
            {submitting
              ? 'Submitting...'
              : 'Submit request'}
          </Text>

        </Pressable>


        {/* Save as draft button */}

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
            (pressed || loadingPhoto || submitting)
              && s.pressed,
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
