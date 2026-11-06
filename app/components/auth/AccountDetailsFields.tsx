import { Pressable, Text, TextInput, View } from 'react-native';
import { styles as s } from '../../styles/ResidentSignUp.styles';

type AccountDetailsFieldsProps = {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  onContinue: () => void;
};

export default function AccountDetailsFields({ name, setName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, onContinue: next }: AccountDetailsFieldsProps) {
  return <>
        <Text style={s.label}>Full name</Text><TextInput accessibilityLabel="Full name" value={name} onChangeText={setName} placeholder="Your full name" autoComplete="name" style={s.input} />
        <Text style={s.label}>Email</Text><TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} style={s.input} />
        <Text style={s.label}>Password</Text><View style={s.passwordField}><TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry={!showPassword} autoComplete="new-password" autoCapitalize="none" autoCorrect={false} style={s.passwordInput} /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword(!showPassword)} style={s.visibility}><Text style={s.link}>{showPassword ? 'Hide' : 'Show'}</Text></Pressable></View>
        <Text style={s.label}>Confirm password</Text><TextInput accessibilityLabel="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your password" secureTextEntry={!showPassword} autoComplete="new-password" autoCapitalize="none" autoCorrect={false} style={s.input} onSubmitEditing={next} />

  </>;
}
