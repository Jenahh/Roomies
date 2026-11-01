import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  Text,
  View,
} from 'react-native';

import { styles } from './WelcomeScreen.styles';
import roomiesLogo from '../assets/Roomies Logo.png';
import roomiesWelcome from '../assets/Roomies Welcome.png';

type WelcomeScreenProps = {
  onGetStarted?: () => void;
  onLogIn?: () => void;
};

export default function WelcomeScreen({ onGetStarted, onLogIn }: WelcomeScreenProps) {

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <Image source={{ uri: roomiesLogo }} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Roomies logo" />
          <Text style={styles.wordmark}>Roomies</Text>
        </View>

        <View style={styles.main}>
          <View style={styles.illustrationFrame}>
            <Image source={{ uri: roomiesWelcome }} style={styles.welcomeImage} resizeMode="contain" accessibilityLabel="Four roommates relaxing together on a sofa" />
          </View>

          <View style={styles.copy}>
            <Text style={styles.title}>Better living,{'\n'}together.</Text>
            <Text style={styles.subtitle}>Share the chores, split the bills, and make room{'\n'}for the good stuff.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={onGetStarted} style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.primaryPressed]}>
            <Text style={styles.primaryLabel}>Get Started</Text><Text style={styles.arrow} aria-hidden>{'\u2192'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onLogIn} style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.secondaryPressed]}>
            <Text style={styles.secondaryLabel}>Log In</Text>
          </Pressable>
          <Text style={styles.finePrint}>Your home. Your people. All in one place.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

