import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { coupleIslanders, coupleName, type Couple, type Season } from '../data';
import { useFavorites } from '../lib/favorites';
import { colors, placementLabel } from '../lib/theme';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

export function CoupleCard({ season, couple }: { season: Season; couple: Couple }) {
  const [a, b] = coupleIslanders(season, couple);
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(couple.id);
  const split = couple.status === 'split';
  // Strongest recent social signal, if any (only shown for couples still together).
  const hotSignal = split
    ? undefined
    : [...(couple.signals ?? [])].sort((x, y) => y.severity - x.severity).find((s) => s.severity >= 0.5);

  return (
    <Link href={{ pathname: '/couple/[id]', params: { id: couple.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.avatars}>
          <Avatar name={a.name} faded={split} />
          <View style={styles.overlap}>
            <Avatar name={b.name} faded={split} />
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{coupleName(season, couple)}</Text>
            {couple.finalePlacement ? (
              <Text style={styles.placement}>{placementLabel(couple.finalePlacement)}</Text>
            ) : null}
          </View>
          <Text style={styles.headline} numberOfLines={2}>
            {couple.headline}
          </Text>
          <View style={styles.badges}>
            <StatusBadge status={couple.status} />
            {hotSignal ? <Text style={styles.signal}>👀 {hotSignal.summary}</Text> : null}
          </View>
        </View>
        <Pressable
          hitSlop={12}
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(couple.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Unfollow couple' : 'Follow couple'}
        >
          <Text style={styles.star}>{fav ? '★' : '☆'}</Text>
        </Pressable>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatars: { flexDirection: 'row', paddingTop: 2 },
  overlap: { marginLeft: -14 },
  body: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text, flexShrink: 1 },
  placement: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  headline: { fontSize: 14, color: colors.textMuted, lineHeight: 19 },
  badges: { gap: 6 },
  signal: { fontSize: 13, color: '#8A5A00', fontWeight: '600' },
  star: { fontSize: 22, color: colors.brand, lineHeight: 24 },
});
