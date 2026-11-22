import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CoupleCard } from '../components/CoupleCard';
import { seasons, type Couple } from '../data';
import { useFavorites } from '../lib/favorites';
import { colors, statusMeta } from '../lib/theme';

type Filter = 'all' | 'together' | 'split' | 'following';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'together', label: '❤️ Together' },
  { key: 'split', label: '💔 Split' },
  { key: 'following', label: '★ Following' },
];

const STILL_ON: Couple['status'][] = ['together', 'engaged', 'married', 'complicated'];

export default function SeasonScreen() {
  // One season for now; the data layer already supports more.
  const season = seasons[0];
  const [filter, setFilter] = useState<Filter>('all');
  const { isFavorite } = useFavorites();

  const stillOn = season.couples.filter((c) => STILL_ON.includes(c.status)).length;
  const total = season.couples.length;

  const couples = useMemo(() => {
    const sorted = [...season.couples].sort(
      (a, b) => (a.finalePlacement ?? 99) - (b.finalePlacement ?? 99),
    );
    switch (filter) {
      case 'together':
        return sorted.filter((c) => STILL_ON.includes(c.status));
      case 'split':
        return sorted.filter((c) => c.status === 'split');
      case 'following':
        return sorted.filter((c) => isFavorite(c.id));
      default:
        return sorted;
    }
  }, [season, filter, isFavorite]);

  return (
    <FlatList
      data={couples}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>
              {season.network} · {season.airDates} · {season.location}
            </Text>
            <Text style={styles.title}>
              {season.showName}
              {'\n'}Season {season.seasonNumber}
            </Text>
            <View style={styles.scoreRow}>
              <Text style={styles.score}>
                {stillOn}/{total}
              </Text>
              <Text style={styles.scoreLabel}>finalist couples still together</Text>
            </View>
            <View style={styles.meter}>
              {season.couples.map((c) => (
                <View
                  key={c.id}
                  style={[styles.meterSeg, { backgroundColor: statusMeta[c.status].color }]}
                />
              ))}
            </View>
          </View>
          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, filter === f.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      renderItem={({ item }) => <CoupleCard season={season} couple={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {filter === 'following'
            ? 'Tap ☆ on a couple to follow them here.'
            : 'No couples match this filter.'}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 48 },
  header: { gap: 16, marginBottom: 16 },
  hero: { backgroundColor: colors.brand, borderRadius: 24, padding: 20, gap: 8 },
  eyebrow: { color: '#FFE3EA', fontSize: 13, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', lineHeight: 33 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  score: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  scoreLabel: { color: '#FFE3EA', fontSize: 14, flexShrink: 1 },
  meter: { flexDirection: 'row', gap: 4, marginTop: 4 },
  meterSeg: { flex: 1, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#FFFFFF55' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#FFFFFF' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 32, fontSize: 15 },
});
