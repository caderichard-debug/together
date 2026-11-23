import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { coupleIslanders, coupleName, findCouple, type TimelineEvent } from '../../data';
import { useData } from '../../lib/data';
import { useFavorites } from '../../lib/favorites';
import { colors, formatDate, placementLabel, statusMeta } from '../../lib/theme';

const DOT_COLOR: Record<NonNullable<TimelineEvent['kind']>, string> = {
  villa: colors.sunset,
  milestone: colors.brand,
  split: statusMeta.split.color,
  update: colors.textMuted,
  rumor: '#D9A400',
};

export default function CoupleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { seasons } = useData();
  const found = findCouple(seasons, id);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!found) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.muted}>We couldn’t find that couple.</Text>
      </View>
    );
  }

  const { season, couple } = found;
  const [a, b] = coupleIslanders(season, couple);
  const split = couple.status === 'split';
  const fav = isFavorite(couple.id);
  const timeline = [...couple.timeline].sort((x, y) => y.date.localeCompare(x.date));
  const signals = couple.signals ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen
        options={{
          title: coupleName(season, couple),
          headerRight: () => (
            <Pressable
              hitSlop={12}
              onPress={() => toggleFavorite(couple.id)}
              accessibilityRole="button"
              accessibilityLabel={fav ? 'Unfollow couple' : 'Follow couple'}
            >
              <Text style={styles.star}>{fav ? '★' : '☆'}</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.hero}>
        <View style={styles.pair}>
          <View style={styles.person}>
            <Avatar name={a.name} size={72} faded={split} />
            <Text style={styles.personName}>{a.name}</Text>
          </View>
          <Text style={styles.heart}>{statusMeta[couple.status].emoji}</Text>
          <View style={styles.person}>
            <Avatar name={b.name} size={72} faded={split} />
            <Text style={styles.personName}>{b.name}</Text>
          </View>
        </View>
        <StatusBadge status={couple.status} large />
        <Text style={styles.headline}>{couple.headline}</Text>
        <Text style={styles.muted}>
          {season.showName} S{season.seasonNumber}
          {couple.finalePlacement ? ` · ${placementLabel(couple.finalePlacement)}` : ''}
        </Text>
      </View>

      {signals.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>👀 Rumor mill</Text>
          <View style={[styles.card, styles.signalCard]}>
            {signals.map((s, i) => (
              <View key={`${s.date}-${i}`} style={styles.signalRow}>
                <View style={[styles.severity, { opacity: 0.35 + s.severity * 0.65 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{s.summary}</Text>
                  <Text style={styles.eventDate}>{formatDate(s.date)} · spotted by AI on social media</Text>
                </View>
              </View>
            ))}
            <Text style={[styles.muted, styles.verified]}>
              Signals are hints, not facts. They never change a couple’s status on their own.
            </Text>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Timeline</Text>
      <View style={styles.card}>
        {timeline.map((event, i) => {
          const ai = event.origin === 'ai-news' || event.origin === 'ai-social';
          return (
            <View key={`${event.date}-${i}`} style={styles.event}>
              <View style={styles.rail}>
                <View style={[styles.dot, { backgroundColor: DOT_COLOR[event.kind ?? 'update'] }]} />
                {i < timeline.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.eventBody}>
                <View style={styles.eventMeta}>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                  {event.kind === 'rumor' ? <Text style={[styles.tag, styles.rumorTag]}>RUMOR</Text> : null}
                  {ai ? (
                    <Text style={styles.tag}>
                      AI{event.confidence !== undefined ? ` · ${Math.round(event.confidence * 100)}%` : ''}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.detail ? <Text style={styles.eventDetail}>{event.detail}</Text> : null}
                {event.sourceUrl ? (
                  <Pressable onPress={() => Linking.openURL(event.sourceUrl!)}>
                    <Text style={styles.eventSource}>{event.sourceLabel ?? 'Source'} ↗</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Sources</Text>
      <View style={styles.card}>
        {couple.sources.map((s) => (
          <Pressable key={s.url} onPress={() => Linking.openURL(s.url)} style={styles.source}>
            <Text style={styles.sourceText}>{s.label} ↗</Text>
          </Pressable>
        ))}
        <Text style={[styles.muted, styles.verified]}>Status last checked {formatDate(couple.lastVerified)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, gap: 12 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  star: { fontSize: 24, color: colors.brand },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  person: { alignItems: 'center', gap: 6, width: 110 },
  personName: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center' },
  heart: { fontSize: 28, marginBottom: 24 },
  headline: { fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 22 },
  muted: { color: colors.textMuted, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signalCard: { backgroundColor: '#FFFBEA', borderColor: '#F3E2A6', gap: 12 },
  signalRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  severity: { width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: '#D9A400' },
  event: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  eventBody: { flex: 1, paddingBottom: 18, gap: 2 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventDate: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rumorTag: { color: '#8A5A00', backgroundColor: '#FFF0C9' },
  eventTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  eventDetail: { fontSize: 14, color: colors.textMuted, lineHeight: 19 },
  eventSource: { fontSize: 13, color: colors.brand, fontWeight: '600', marginTop: 2 },
  source: { paddingVertical: 8 },
  sourceText: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  verified: { marginTop: 8 },
});
