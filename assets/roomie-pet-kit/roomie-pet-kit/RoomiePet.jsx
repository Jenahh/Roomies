import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { accessoryLayers } from './roomieAccessories';

export const ROOMIE_COLORS = {
  blue: '#6A83E6',
  purple: '#AF98EB',
  pink: '#EF9DB9',
  green: '#79C9A0',
  yellow: '#F5CA75',
};

const sprites = {
  happy: {
    body: require('./assets/happy-body.png'),
    details: require('./assets/happy-details.png'),
  },
  annoyed: {
    body: require('./assets/annoyed-body.png'),
    details: require('./assets/annoyed-details.png'),
  },
  stressed: {
    body: require('./assets/stressed-body.png'),
    details: require('./assets/stressed-details.png'),
  },
  'happy-3d': {
    body: require('./assets/happy-3d-body.png'),
    details: require('./assets/happy-3d-details.png'),
  },
  'stressed-3d': {
    body: require('./assets/stressed-3d-body.png'),
    details: require('./assets/stressed-3d-details.png'),
  },
  'annoyed-3d': {
    body: require('./assets/annoyed-3d-body.png'),
    details: require('./assets/annoyed-3d-details.png'),
  },
};

export default function RoomiePet({ mood = 'happy', color = ROOMIE_COLORS.blue, size = 128, accessories = [] }) {
  const moodKey = mood === 'attention' || mood === 'attention-3d'
    ? mood.replace('attention', 'annoyed')
    : mood;
  const is3d = typeof moodKey === 'string' && moodKey.endsWith('-3d');
  const resolvedMood = Object.prototype.hasOwnProperty.call(sprites, moodKey) ? moodKey : (is3d ? 'happy-3d' : 'happy');
  const sprite = sprites[resolvedMood];

  function renderAccessories(behindPet) {
    return accessoryLayers(accessories, behindPet).map(({ id, image, frame, slot }) => {
      const [left, top, width, height] = frame.map(value => value * size);
      // The neutral and stressed eyes sit lower than the happy eyes.
      const eyeOffset = id === 'round-glasses' && !resolvedMood.startsWith('happy') ? size * 0.06 : 0;
      const bodyOffset = slot === 'body' && resolvedMood.startsWith('stressed') ? size * 0.03 : 0;
      return (
        <Image
          key={id}
          source={image}
          resizeMode="stretch"
          style={{ position: 'absolute', left, top: top + eyeOffset + bodyOffset, width, height }}
        />
      );
    });
  }

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`Roomie pet, ${resolvedMood.replace(/-3d$/, '')}`}>
      {renderAccessories(true)}
      <Image source={sprite.body} resizeMode="contain" style={[styles.layer, { tintColor: color }]} />
      <Image source={sprite.details} resizeMode="contain" style={styles.layer} />
      {renderAccessories(false)}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
