import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

/** Initials avatar — keeps the app free of copyrighted cast photos. */
export function Avatar({ name, size = 44, faded }: { name: string; size?: number; faded?: boolean }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        faded && styles.faded,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }, faded && styles.fadedText]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  text: { color: colors.brand, fontWeight: '700' },
  faded: { backgroundColor: '#E9ECEF' },
  fadedText: { color: '#4F5965' },
});
