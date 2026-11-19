import { Image, StyleSheet, View } from 'react-native';
import dishes from '../../../assets/chore-icons/dishes.png';
import counters from '../../../assets/chore-icons/counters.png';
import trash from '../../../assets/chore-icons/trash.png';
import floors from '../../../assets/chore-icons/floors.png';
import laundry from '../../../assets/chore-icons/laundry.png';
import plants from '../../../assets/chore-icons/plants.png';
import custom from '../../../assets/chore-icons/custom.png';
import { choreLooks, resolveChoreLook, type ChoreLook } from '../../data/chorePresets';
import { getImageSource } from '../../utils/imageSource';

const icons = { dishes, counters, trash, floors, laundry, plants, custom } satisfies Record<ChoreLook, string | number>;

export function ChoreBadge({ look, title, muted = false }: { look?: ChoreLook; title?: string; muted?: boolean }) {
  const key = resolveChoreLook(look, title);
  return <View accessible={false} style={[styles.badge, { backgroundColor: muted ? '#E2E2E2' : choreLooks[key].tint }]}>
    <Image accessible={false} source={getImageSource(icons[key])} resizeMode="contain" style={[styles.image, muted && styles.muted]} />
  </View>;
}

const styles = StyleSheet.create({
  badge: { width: 36, height: 36, borderRadius: 12, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  image: { width: 32, height: 32 },
  muted: { tintColor: '#747474' },
});
