import { StyleSheet, Text, View } from 'react-native';
import type { RelationshipStatus } from '../data/types';
import { statusMeta } from '../lib/theme';

export function StatusBadge({ status, large }: { status: RelationshipStatus; large?: boolean }) {
  const meta = statusMeta[status];
  return (
    <View style={[styles.badge, large && styles.large, { backgroundColor: meta.background }]}>
      <Text style={[styles.text, large && styles.largeText, { color: meta.color }]}>
        {meta.emoji} {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  large: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontSize: 13, fontWeight: '600' },
  largeText: { fontSize: 15 },
});
