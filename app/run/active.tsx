import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useRunStore } from '../../src/stores/useRunStore';
import { useGoalStore } from '../../src/stores/useGoalStore';
import { useCoachingStore } from '../../src/stores/useCoachingStore';
import { useGPSTracking } from '../../src/hooks/useGPSTracking';
import { useAutoPause } from '../../src/hooks/useAutoPause';
import { useHeartRate } from '../../src/hooks/useHeartRate';
import { useCoaching } from '../../src/hooks/useCoaching';
import { formatPace, formatDistance, formatDuration } from '../../src/utils/formatters';
import { TTSService } from '../../src/services/coaching/TTSService';
import { LocationService } from '../../src/services/gps/LocationService';

export default function ActiveScreen() {
  const router = useRouter();
  const {
    status, elapsedSeconds, totalDistanceKm, currentPaceSecPerKm,
    avgPaceSecPerKm, heartRate, tickElapsed, pauseRun, resumeRun, finishRun,
  } = useRunStore();
  const { targetDistanceKm } = useGoalStore();
  const { currentMessage } = useCoachingStore();
  const { checkMotion } = useAutoPause();
  const { evaluate } = useCoaching();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActive = status === 'active' || status === 'paused';

  // GPS tracking
  useGPSTracking(isActive, (point) => {
    checkMotion(point);
    evaluate();
  });

  // Heart rate
  useHeartRate(isActive);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      tickElapsed();
      evaluate();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-navigate to finish when done
  useEffect(() => {
    if (status === 'finished') {
      LocationService.stopTracking();
      TTSService.stop();
      router.replace('/run/finish');
    }
  }, [status]);

  function handleFinish() {
    finishRun();
  }

  const progressPct = Math.min((totalDistanceKm / targetDistanceKm) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>

      {/* Pause/Resume indicator */}
      {status === 'paused' && (
        <View style={styles.pauseBanner}>
          <Text style={styles.pauseText}>⏸ 자동 일시정지 · 움직이면 재시작</Text>
        </View>
      )}

      {/* Coaching toast */}
      {currentMessage && (
        <View style={styles.coachingToast}>
          <Text style={styles.coachingText}>{currentMessage.text}</Text>
        </View>
      )}

      {/* Main metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.primaryMetric}>
          <Text style={styles.metricValue}>{formatDistance(totalDistanceKm)}</Text>
          <Text style={styles.metricLabel}>달린 거리</Text>
        </View>

        <View style={styles.secondaryMetrics}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValueMd}>{formatDuration(elapsedSeconds)}</Text>
            <Text style={styles.metricLabel}>시간</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValueMd}>{formatPace(currentPaceSecPerKm)}</Text>
            <Text style={styles.metricLabel}>현재 페이스</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValueMd}>{formatPace(avgPaceSecPerKm)}</Text>
            <Text style={styles.metricLabel}>평균 페이스</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricValueMd, heartRate >= 180 && styles.dangerText]}>
              {heartRate > 0 ? `${heartRate}bpm` : '--'}
            </Text>
            <Text style={styles.metricLabel}>심박수</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => status === 'active' ? pauseRun() : resumeRun()}
        >
          <Text style={styles.pauseButtonText}>{status === 'active' ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.finishButtonText}>종료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  pauseBanner: {
    backgroundColor: colors.danger,
    padding: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  pauseText: { color: '#fff', fontSize: fontSizes.sm, fontWeight: '600' },
  coachingToast: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  coachingText: { color: colors.text, fontSize: fontSizes.md, lineHeight: 22 },
  metricsContainer: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  primaryMetric: { alignItems: 'center', marginBottom: spacing.xl },
  metricValue: { fontSize: 80, fontWeight: '900', color: colors.text },
  metricValueMd: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text },
  metricLabel: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  dangerText: { color: colors.danger },
  secondaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 40,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: { fontSize: fontSizes.xl },
  finishButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  finishButtonText: { color: colors.text, fontSize: fontSizes.lg, fontWeight: '600' },
});
