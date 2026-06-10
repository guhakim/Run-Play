import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useUserStore } from '../../src/stores/useUserStore';

export default function HomeScreen() {
  const router = useRouter();
  const { name, totalPoints, streakDays } = useUserStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {name}! 👟</Text>
        <View style={styles.stats}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}P</Text>
            <Text style={styles.statLabel}>총 포인트</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{streakDays}일</Text>
            <Text style={styles.statLabel}>연속 기록</Text>
          </View>
        </View>
      </View>

      <View style={styles.watchStatus}>
        <Text style={styles.watchText}>⌚ 워치 연결 대기 중</Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push('/run/setup')}
        activeOpacity={0.85}
      >
        <Text style={styles.startButtonText}>달리기 시작</Text>
        <Text style={styles.startButtonSub}>START RUNNING 🔥</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: { gap: spacing.md },
  greeting: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text },
  stats: { flexDirection: 'row', gap: spacing.sm },
  statBadge: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  watchStatus: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  watchText: { fontSize: fontSizes.md, color: colors.textSecondary },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  startButtonText: { fontSize: fontSizes.xxl, fontWeight: '800', color: '#fff' },
  startButtonSub: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});
