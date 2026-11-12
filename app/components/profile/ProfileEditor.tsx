import { useState, type ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { styles as s } from '../../styles/ProfileScreen.styles';
import ProfileIdentity from './ProfileIdentity';
import ProfileDetailsCard from './ProfileDetailsCard';
import SignOutButton from './SignOutButton';

type ProfileValues = { name: string; location: string };
type ProfileEditorProps = {
  name: string;
  email: string;
  role: ResidentUser['role'];
  color?: string;
  locationLabel: string;
  location: string;
  locationEditable?: boolean;
  storageError?: string;
  onSave: (values: ProfileValues) => void;
  onSignOut: () => void;
  children?: ReactNode;
};

export default function ProfileEditor({ name, email, role, color, locationLabel, location, locationEditable = false, storageError, onSave, onSignOut, children }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftLocation, setDraftLocation] = useState(location);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function reset() {
    setDraftName(name); setDraftLocation(location); setError(''); setMessage('');
  }

  function save() {
    if (!draftName.trim()) { setError('Enter your name.'); return; }
    onSave({ name: draftName.trim(), location: locationEditable ? draftLocation.trim() : location });
    setError(''); setMessage('Profile updated.'); setEditing(false);
  }

  return (
    <>
      <ProfileIdentity name={name} email={email} role={role} color={color} />
      {!editing && <Pressable accessibilityRole="button" accessibilityLabel="Edit personal details" onPress={() => { reset(); setEditing(true); }} style={({ pressed }) => [s.editProfile, pressed && s.pressed]}><Text style={s.editProfileText}>Edit profile</Text></Pressable>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {!!message && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>{message}</Text>}
      {editing && <ProfileDetailsCard fields={[
        { label: 'Your name', value: draftName, onChange: setDraftName, autoFocus: true, autoComplete: 'name' },
        { label: 'Email', value: email },
        { label: locationLabel, value: draftLocation, onChange: locationEditable ? setDraftLocation : undefined, placeholder: locationEditable ? 'Give your home a name' : undefined },
      ]} error={error} onSave={save} onCancel={() => { reset(); setEditing(false); }} />}
      {children}
      <SignOutButton onSignOut={onSignOut} />
    </>
  );
}
