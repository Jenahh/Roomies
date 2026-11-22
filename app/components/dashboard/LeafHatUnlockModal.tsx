import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import leafHat from '../../../assets/roomie-pet-kit/roomie-pet-kit/accessories/sprout-hat.png';
import { styles as dashboard } from '../../styles/ResidentDashboard.styles';
import { getImageSource } from '../../utils/imageSource';
import ConfettiBurst from '../ConfettiBurst';

export default function LeafHatUnlockModal({ onDismiss }: { onDismiss: () => void }) {
  const [shown, setShown] = useState(false);

  return <Modal visible transparent animationType="fade" onShow={() => setShown(true)} onRequestClose={onDismiss}>
    <View style={dashboard.modalBackdrop}>
      <ScrollView style={dashboard.modalScroll} contentContainerStyle={dashboard.modalCard}>
        <View style={styles.preview}>
          <Image source={getImageSource(leafHat)} resizeMode="contain" accessibilityLabel="Leaf Hat" style={styles.hat} />
          <ConfettiBurst start={shown} spread={4.5} duration={1250} pieceSize={9} />
        </View>
        <Text accessibilityRole="header" style={dashboard.sectionTitle}>You can now unlock the Leaf Hat!</Text>
        <Pressable accessibilityRole="button" onPress={onDismiss} style={dashboard.closeButton}>
          <Text style={dashboard.linkText}>Got it</Text>
        </Pressable>
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  hat: { width: 112, height: 112 },
});
