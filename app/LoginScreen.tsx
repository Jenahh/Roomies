import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import roomiesLogo from '../assets/Roomies Logo.png';
import { styles } from './styles/LoginScreen.styles';
import { demoResident, type ResidentUser } from './data/demoAccount';

type LoginScreenProps = {
  onBack?: () => void;
  onCreateAccount?: () => void;
  onResidentLogin: (user: ResidentUser) => void;
};

export default function LoginScreen({ onBack, onCreateAccount, onResidentLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function logIn() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Enter a valid email address.');
    } else if (!password) {
      setMessage('Enter your password.');
    } else if (email.trim().toLowerCase() === demoResident.email && password === '1234') {
      // Local demo credentials; replace with backend authentication when available.
      setMessage('');
      onResidentLogin(demoResident);
    } else {
      setMessage('Incorrect email or password.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityRole="button" style={({ pressed }) => [styles.backButton, pressed && styles.linkPressed]}>
            <Text style={styles.backText}>{'\u2190'}  Back</Text>
          </Pressable>
          <View style={styles.brand}>
            <Image source={{ uri: roomiesLogo }} style={styles.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />
            <Text style={styles.wordmark}>Roomies</Text>
          </View>
        </View>

        <Text accessibilityRole="header" style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>Log in to get back to your people and your space.</Text>

        <View style={styles.form}>
          <Text nativeID="email-label" style={styles.label}>Email</Text>
          <TextInput accessibilityLabel="Email" aria-labelledby="email-label" value={email} onChangeText={setEmail} placeholder="jane.doe@example.edu" placeholderTextColor="#7B7D87" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={styles.input} />

          <Text nativeID="password-label" style={[styles.label, styles.passwordLabel]}>Password</Text>
          <View style={styles.passwordField}>
            <TextInput accessibilityLabel="Password" aria-labelledby="password-label" value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#7B7D87" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" onSubmitEditing={logIn} style={styles.passwordInput} />
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityState={{ expanded: showPassword }} onPress={() => setShowPassword(value => !value)} style={({ pressed }) => [styles.visibilityButton, pressed && styles.linkPressed]}>
              <Text style={styles.visibilityText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => setMessage('Password reset is not connected yet.')} style={({ pressed }) => [styles.forgotButton, pressed && styles.linkPressed]}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
          {!!message && <Text accessibilityRole="alert" aria-live="polite" style={styles.message}>{message}</Text>}
          <Pressable accessibilityRole="button" onPress={logIn} style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed]}>
            <Text style={styles.loginText}>Log In</Text>
            <Text aria-hidden style={styles.arrow}>{'\u2192'}</Text>
          </Pressable>
        </View>

        <View style={styles.createAccount}>
          <Text style={styles.createPrompt}>New to Roomies? </Text>
          <Pressable accessibilityRole="link" onPress={onCreateAccount} style={({ pressed }) => pressed && styles.linkPressed}>
            <Text style={styles.link}>Create Account</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Your home. Your people. A private space.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
