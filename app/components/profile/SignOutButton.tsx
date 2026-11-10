import { Pressable, Text } from 'react-native';
import { styles as s } from '../../styles/ProfileScreen.styles';

export default function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onSignOut} style={({ pressed }) => [s.signOut, pressed && s.pressed]}>
      <Text style={s.signOutText}>Sign out</Text>
    </Pressable>
  );
}
