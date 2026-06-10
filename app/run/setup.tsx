import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useGoalStore } from '../../src/stores/useGoalStore';
import { useRunStore } from '../../src/stores/useRunStore';
import { useCoachingStore } from '../../src/stores/useCoachingStore';
import { formatPace } from '../../src/utils/formatters';
import { fireTrigger } from '../../src/services/coaching/CoachingOrchestrator';
import { resetOrchestrator } from '../../src/services/coaching/CoachingOrchestrator';
import { TTSService } from '../../src/services/coaching/TTSService';

const DISTANCES = [1, 2, 3, 5, 7, 10, 15, 21];
const PACE_MIN_SEC = 240;  // 4:00
const PACE_MAX_SEC = 480;  // 8:00

export default function SetupScreen() {
  const router = useRouter();
  const { targetDistanceKm, targetPaceSecPerKm, setTargetDistance, setTargetPace } = useGoalStore();
  const { startRun, resetRun } = useRunStore();
  const { resetSession } = useCoachingStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      startRun();
      fireTrigger('START_RUN');
      router.replace('/run/active');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleStart() {
    resetRun();
    resetSession();
    resetOrchestrator();
    TTSService.stop();
    setCountdown(3);
  }

  const paceIndex = Math.round((targetPaceSecPerKm - PACE_MIN_SEC) / 15);

  return (
    <View style={styles.container}>
      {countdown !== null ? (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownNumber}>{countdown === 0 ? '달려!' : countdown}</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← 뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.title}>오늘의 목표</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>목표 거리</Text>
            <Text style={styles.valueText}>{targetDistanceKm}km</Text>
            <View style={styles.distanceRow}>
              {DISTANCES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.distChip, targetDistanceKm === d && styles.distChipActive]}
                  onPress={() => setTargetDistance(d)}
                >
                  <Text style={[styles.distChipText, targetDistanceKm === d && styles.distChipTextActive]}>
                    {d}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>목표 페이스</Text>
            <Text style={styles.valueText}>{formatPace(targetPaceSecPerKm)} /km</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={(PACE_MAX_SEC - PACE_MIN_SEC) / 15}
              step={1}
              value={paceIndex}
              onValueChange={(v) => setTargetPace(PACE_MIN_SEC + Math.round(v) * 15)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surfaceLight}
              thumbTintColor={colors.primary}
            />
            <View style={styles.paceLabels}>
              <Text style={styles.paceLabel}>빠르게 4:00</Text>
              <Text style={styles.paceLabel}>천천히 8:00</Text>
            </View>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {targetDistanceKm}km를 {formatPace(targetPaceSecPerKm)} 페이스로
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.startButtonText}>준비됐어! 🏃</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 56 },
  countdownContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  countdownNumber: { fontSize: 128, fontWeight: '900', color: colors.primary },
  header: { marginBottom: spacing.xl },
  backButton: { marginBottom: spacing.md },
  backText: { color: colors.textSecondary, fontSize: fontSizes.md },
  title: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text },
  section: { marginBottom: spacing.xl },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  valueText: { fontSize: fontSizes.huge, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  distanceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  distChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  distChipText: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: '600' },
  distChipTextActive: { color: '#fff' },
  slider: { width: '100%', height: 40 },
  paceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
  paceLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryText: { fontSize: fontSizes.md, color: colors.text, fontWeight: '600' },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  startButtonText: { fontSize: fontSizes.xl, fontWeight: '800', color: '#fff' },
});
