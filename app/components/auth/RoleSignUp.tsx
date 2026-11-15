import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { styles as s } from '../../styles/ResidentSignUp.styles';
import { demoJoinCodes } from '../../data/demoJoinCodes';
import { matchesResidentInvitation } from '../../data/residentInvitations';
import type { ResidentUser } from '../../data/demoAccount';
import AccountDetailsFields from './AccountDetailsFields';
import SignupProgress from './SignupProgress';
import RoomiePet from '../RoomiePet';

export type SignUpNavigationProps = {
  onBack: () => void;
  onLogIn: () => void;
  onRequestSubmitted: () => void;
};

const roleContent = {
  resident: {
    label: 'Resident', avatarBackground: '#EDF0FF',
    title: 'Your shared home\nstarts here.', joinTitle: 'Join your\nhousehold.',
    subtitle: 'Create your resident account to get started.',
    codeLabel: 'Property manager join code',
    notice: 'Ask your property manager for your resident invitation code.',
    submit: 'Create account & join household',
  },
  assistant: {
    label: 'Resident Assistant', avatarBackground: '#F2EEFF',
    title: 'Support your\ncommunity.', joinTitle: 'Join as a\nResident Assistant.',
    subtitle: 'Create your Resident Assistant account to get started.',
    codeLabel: 'RA join code',
    notice: 'Ask your property manager for your RA invitation code.',
    submit: 'Create account & request RA access',
  },
  'property-manager': {
    label: 'Property Manager', avatarBackground: '#EAF6F0',
    title: 'Manage your\ncommunity.', joinTitle: 'Join as a\nProperty Manager.',
    subtitle: 'Create your Property Manager account to get started.',
    codeLabel: 'Property manager join code',
    notice: 'Ask your administrator for your property manager invitation code.',
    submit: 'Create account & request manager access',
  },
} as const;

export default function RoleSignUp({ role, onBack, onLogIn, onRequestSubmitted }: SignUpNavigationProps & { role: ResidentUser['role'] }) {
  const content = roleContent[role];
  const joinCode = demoJoinCodes[role];
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  function next() {
    if (!name.trim()) { setError('Enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Your passwords do not match.'); return; }
    setError(''); setStep(2); if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }
  function join() {
    if (!code.trim()) { setError('Enter your ' + content.codeLabel.toLowerCase() + '.'); return; }
    if (code.trim().toUpperCase() !== joinCode) {
      let invited = false;
      try { invited = role === 'resident' && matchesResidentInvitation(code, email); }
      catch { setError('Could not read invitations. Allow browser storage and try again.'); return; }
      if (!invited) { setError(role === 'resident' ? 'Invalid join code for this email address. Check your invitation or use the demo code R123456.' : `Invalid demo join code. Use ${joinCode} to preview the approval step.`); return; }
    }
    // Demo navigation only: this does not grant household access or submit to a service.
    setPassword(''); setConfirmPassword(''); setError('');
    onRequestSubmitted();
  }
  return <SafeAreaView style={s.safeArea}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel={step === 1 ? 'Back to role selection' : 'Back to account details'} onPress={() => { setError(''); if (step === 2) setStep(1); else onBack(); }} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable><Text style={s.step}>{step} of 2</Text></View>
    <SignupProgress step={step === 1 ? 2 : 3} />
    <View style={[s.homeIcon, { backgroundColor: content.avatarBackground }]}>
      {role === 'assistant'
        ? <RoomiePet role="assistant" size={72} accessibilityLabel="Resident Assistant Roomie" />
        : role === 'property-manager'
          ? <RoomiePet role="property-manager" size={72} accessibilityLabel="Property Manager Roomie" />
          : <RoomiePet mood="happy-3d" size={72} accessibilityLabel="Resident Roomie Pet" />}
    </View>
    <Text accessibilityRole="header" style={s.title}>{step === 1 ? content.title : content.joinTitle}</Text>{step === 1 && <Text style={s.subtitle}>{content.subtitle}</Text>}
    <View style={[s.card, step === 2 && s.joinCard]}>
      {step === 1 && <Text accessibilityRole="header" style={s.cardTitle}>{content.label} Sign Up</Text>}
      {step === 1 ? <AccountDetailsFields name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} showPassword={showPassword} setShowPassword={setShowPassword} onContinue={next} /> : <>
        <Text style={s.label}>{content.codeLabel}</Text><TextInput accessibilityLabel={content.codeLabel} value={code} onChangeText={setCode} placeholder="Enter your join code" autoCapitalize="characters" autoCorrect={false} style={s.input} onSubmitEditing={join} />
        <View style={s.notice}><Text style={s.noticeText}>{content.notice} Demo code: {joinCode}.</Text></View>
      </>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={step === 1 ? next : join} style={({ pressed }) => [s.continue, pressed && s.pressed]}><Text style={s.continueText}>{step === 1 ? 'Continue' : content.submit}</Text></Pressable>
    </View>
    <View style={s.login}><Text style={s.body}>Already have an account?</Text><Pressable accessibilityRole="link" onPress={onLogIn} style={s.visibility}><Text style={s.link}>Log in</Text></Pressable></View>
  </ScrollView></SafeAreaView>;
}
