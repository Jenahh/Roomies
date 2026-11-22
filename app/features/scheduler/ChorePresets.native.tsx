import { Pressable, Text, View } from 'react-native';
import { choreLooks, chorePresets, type ChoreLook } from '../../data/chorePresets';

import { ChoreBadge } from './ChoreBadge';

export { ChoreBadge };

export function ChorePresets({ onPick, selected }: { selected?: ChoreLook; onPick: (preset: typeof chorePresets[number]) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Chore presets" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {chorePresets.map(preset => (
        <Pressable
          key={preset.look}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === preset.look }}
          onPress={() => onPick(preset)}
          style={{ flexBasis: '48%', flexGrow: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 5, borderWidth: 1, borderColor: selected === preset.look ? '#675BC2' : '#E5E2EB', borderRadius: 12, backgroundColor: selected === preset.look ? '#EFECFF' : '#FFFFFF' }}
        >
          <ChoreBadge look={preset.look} />
          <Text style={{ flex: 1, flexWrap: 'wrap', color: '#303244', fontSize: 11, fontWeight: '600' }}>{choreLooks[preset.look].label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
