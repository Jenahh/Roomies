import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { styles as s } from '../../styles/ResidentSignUp.styles';
import PasswordVisibilityIcon from './PasswordVisibilityIcon';

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return <>
        <TextInput accessibilityLabel="Full name" value={name} onChangeText={setName} placeholder="Your full name" autoComplete="name" style={s.input} />
        <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} style={s.input} />
        <View style={s.passwordField}>
          <TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry={!showPassword} autoComplete="new-password" autoCapitalize="none" autoCorrect={false} style={s.passwordInput} />
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityState={{ expanded: showPassword }} onPress={() => setShowPassword(!showPassword)} style={s.visibility}>
            <PasswordVisibilityIcon visible={showPassword} />
          </Pressable>
        </View>
        <View style={s.passwordField}>
          <TextInput accessibilityLabel="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your password" secureTextEntry={!showConfirmPassword} autoComplete="new-password" autoCapitalize="none" autoCorrect={false} style={s.passwordInput} onSubmitEditing={next} />
          <Pressable accessibilityRole="button" accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} accessibilityState={{ expanded: showConfirmPassword }} onPress={() => setShowConfirmPassword(value => !value)} style={s.visibility}>
            <PasswordVisibilityIcon visible={showConfirmPassword} />
          </Pressable>
        </View>

  </>;
}
