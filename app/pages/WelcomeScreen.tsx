import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Image,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../styles/WelcomeScreen.styles';
import roomiesLogo from '../../assets/Roomies Logo.png';
import roomiesWelcome from '../../assets/Roomies Welcome.png';
import { getImageSource } from '../utils/imageSource';

type WelcomeScreenProps = {
  onGetStarted?: () => void;
  onLogIn?: () => void;
};

export default function WelcomeScreen({ onGetStarted, onLogIn }: WelcomeScreenProps) {
  const { height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [contentWidth, setContentWidth] = useState(0);
  const availableHeight = Math.max(0, height - insets.top - insets.bottom);
  const compact = availableHeight < 700 || fontScale > 1.15;
  const imageMaxHeight = Math.max(112, availableHeight * (compact ? 0.28 : 0.36) / Math.max(1, fontScale));
  const imageWidth = Math.min(contentWidth || 372, 372, imageMaxHeight * (690 / 570));
  const imageHeight = imageWidth / (690 / 570);
  // React Native Web does not shrink this headline with adjustsFontSizeToFit.
  // Use the measured content width so the entire sentence fits on phones too.
  const titleSize = Math.min(30, (contentWidth || 280) / 12.4);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={[styles.page, { paddingTop: compact ? 8 : 16, paddingBottom: compact ? 8 : 16 }]}>
        <View style={styles.header}>
          <Image source={getImageSource(roomiesLogo)} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Roomies logo" />
          <Text style={styles.wordmark}>Roomies</Text>
        </View>

        <View style={[styles.main, { paddingVertical: compact ? 8 : 16 }]} onLayout={event => {
          const nextWidth = event.nativeEvent.layout.width;
          setContentWidth(currentWidth => currentWidth === nextWidth ? currentWidth : nextWidth);
        }}>
          <View style={[styles.illustrationFrame, { marginBottom: compact ? 12 : 20 }]}>
            <Image source={getImageSource(roomiesWelcome)} style={[styles.welcomeImage, { width: imageWidth, height: imageHeight }]} resizeMode="contain" accessibilityLabel="Four roommates relaxing together on a sofa" />
          </View>

          <View style={styles.copy}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.title, { fontSize: titleSize, lineHeight: Math.ceil(titleSize * 1.3) }]}>Better living, together.</Text>
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
