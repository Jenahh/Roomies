import { Pressable, Text, TextInput, View } from 'react-native';
import { styles as s } from '../../styles/ProfileScreen.styles';

export type ProfileDetailField = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: 'name';
};

type ProfileDetailsCardProps = {
  fields: ProfileDetailField[];
  error?: string;
  onSave?: () => void;
  onCancel?: () => void;
};

export default function ProfileDetailsCard({ fields, error, onSave, onCancel }: ProfileDetailsCardProps) {
  return (
    <View style={s.card}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Personal details</Text>
      {fields.map(field => (
        <View key={field.label} style={s.detailField}>
          <Text style={s.label}>{field.label}</Text>
          {field.onChange ? <TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} autoFocus={field.autoFocus} autoComplete={field.autoComplete} style={s.input} /> : <Text selectable style={s.email}>{field.value || 'Not set'}</Text>}
        </View>
      ))}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {onSave && <Pressable accessibilityRole="button" onPress={onSave} style={({ pressed }) => [s.save, pressed && s.pressed]}><Text style={s.saveText}>Save changes</Text></Pressable>}
      {onCancel && <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [s.edit, pressed && s.pressed]}><Text style={s.link}>Cancel</Text></Pressable>}
    </View>
  );
}
