import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useRunStore } from '../../src/stores/useRunStore';
import { formatDistance, formatDuration, formatPace } from '../../src/utils/formatters';

export default function FinishScreen() {
  const router = useRouter();
  const { totalDistanceKm, elapsedSeconds, avgPaceSecPerKm, finishRun } = useRunStore();

  function handleEndRun() {
    finishRun();
    router.replace('/run/report');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>완주 성공!</Text>
      <Text style={styles.subtitle}>목표를 완벽하게 정복했어요</Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>달린 거리</Text>
          <Text style={styles.statValue}>{formatDistance(totalDistanceKm)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 시간</Text>
          <Text style={styles.statValue}>{formatDuration(elapsedSeconds)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>평균 페이스</Text>
          <Text style={styles.statValue}>{formatPace(avgPaceSecPerKm)} /km</Text>
        </View>
      </View>

      <Text style={styles.cooldownHint}>잠깐 걸으면서 호흡을 고르세요 🧘</Text>

      <TouchableOpacity style={styles.endButton} onPress={handleEndRun} activeOpacity={0.85}>
        <Text style={styles.endButtonText}>리포트 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 80,
    alignItems: 'center',
  },
  emoji: { fontSize: 72, marginBottom: spacing.md },
  title: { fontSize: fontSizes.huge, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: fontSizes.lg, color: colors.textSecondary, marginBottom: spacing.xl },
  statsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: fontSizes.md, color: colors.textSecondary },
  statValue: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  cooldownHint: { fontSize: fontSizes.md, color: colors.textMuted, marginBottom: spacing.xl },
  endButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
  },
  endButtonText: { fontSize: fontSizes.xl, fontWeight: '800', color: '#fff' },
});
