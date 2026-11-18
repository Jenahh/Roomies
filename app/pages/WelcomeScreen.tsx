import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  View,
} from 'react-native';

import { styles } from '../styles/WelcomeScreen.styles';
import roomiesLogo from '../../assets/Roomies Logo.png';
import roomiesWelcome from '../../assets/Roomies Welcome.png';
import { getImageSource } from '../utils/imageSource';

type WelcomeScreenProps = {
  onGetStarted?: () => void;
  onLogIn?: () => void;
};

export default function WelcomeScreen({ onGetStarted, onLogIn }: WelcomeScreenProps) {

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <Image source={getImageSource(roomiesLogo)} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Roomies logo" />
          <Text style={styles.wordmark}>Roomies</Text>
        </View>

        <View style={styles.main}>
          <View style={styles.illustrationFrame}>
            <Image source={getImageSource(roomiesWelcome)} style={styles.welcomeImage} resizeMode="contain" accessibilityLabel="Four roommates relaxing together on a sofa" />
          </View>

          <View style={styles.copy}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.title}>Better living, together.</Text>
            <Text style={styles.subtitle}>Share the chores, split the bills, and make room for the good stuff.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={onGetStarted} style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.primaryPressed]}>
            <Text style={styles.primaryLabel}>Get Started</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onLogIn} style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.secondaryPressed]}>
            <Text style={styles.secondaryLabel}>Log In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
