import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useRunStore } from '../../src/stores/useRunStore';
import { useGoalStore } from '../../src/stores/useGoalStore';
import { useCoachingStore } from '../../src/stores/useCoachingStore';
import { useUserStore } from '../../src/stores/useUserStore';
import { formatDistance, formatDuration, formatPace } from '../../src/utils/formatters';
import { calculatePoints } from '../../src/constants/points';
import { ShareCardService } from '../../src/services/share/ShareCardService';
import { useHistoryStore, buildHistoryRun } from '../../src/stores/useHistoryStore';
import type { GPSPoint } from '../../src/types/run';

// react-native-maps는 iOS/Android 전용 — 웹에서는 lazy import
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Polyline = maps.Polyline;
  Marker = maps.Marker;
}

type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

function routeToRegion(route: GPSPoint[]): Region | null {
  if (route.length < 2) return null;
  const lats = route.map(p => p.latitude);
  const lons = route.map(p => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.004);
  const lonDelta = Math.max((maxLon - minLon) * 1.5, 0.004);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

export default function ReportScreen() {
  const router = useRouter();
  const shareCardRef = useRef(null);

  const { totalDistanceKm, elapsedSeconds, avgPaceSecPerKm, maxHeartRate, heartRateHistory, route } = useRunStore();
  const { targetDistanceKm, targetPaceSecPerKm } = useGoalStore();
  const { messages } = useCoachingStore();
  const { name, streakDays, addPoints } = useUserStore();

  const { addRun } = useHistoryStore();
  const savedRef = useRef(false);

  const avgHeartRate = heartRateHistory.length
    ? Math.round(heartRateHistory.reduce((a, b) => a + b, 0) / heartRateHistory.length)
    : 0;

  const points = calculatePoints({
    actualDistanceKm: totalDistanceKm,
    targetDistanceKm,
    avgPaceSecPerKm,
    targetPaceSecPerKm,
    maxHeartRate,
    streakDays,
  });

  // Save run to history once on mount
  useEffect(() => {
    if (savedRef.current || totalDistanceKm <= 0) return;
    savedRef.current = true;
    addRun(buildHistoryRun({
      distanceKm: totalDistanceKm,
      durationSeconds: elapsedSeconds,
      avgPaceSecPerKm,
      maxHeartRate,
      avgHeartRate,
      heartRateHistory,
      targetDistanceKm,
      targetPaceSecPerKm,
      pointsEarned: points,
      coachingMessages: messages.map(m => m.text),
    }));
  }, []);

  async function handleShare() {
    try {
      await ShareCardService.captureAndShare(shareCardRef);
    } catch (e) {
      Alert.alert('공유 실패', '공유 카드를 생성하는 데 실패했어요.');
    }
  }

  const region = routeToRegion(route);
  const coords = route.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
  const startPoint = coords[0] ?? null;
  const endPoint = coords[coords.length - 1] ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>갓생 리포트 📊</Text>

      {/* Route Map — iOS/Android 전용 */}
      {Platform.OS !== 'web' && region && coords.length >= 2 && MapView ? (
        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Polyline
              coordinates={coords}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
            {startPoint && (
              <Marker coordinate={startPoint} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.markerStart}>
                  <Text style={styles.markerText}>출발</Text>
                </View>
              </Marker>
            )}
            {endPoint && (
              <Marker coordinate={endPoint} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.markerEnd}>
                  <Text style={styles.markerText}>완주</Text>
                </View>
              </Marker>
            )}
          </MapView>
          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>{formatDistance(totalDistanceKm)} 완주</Text>
          </View>
        </View>
      ) : null}

      {/* Stats */}
      <View style={styles.card}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 거리</Text>
          <Text style={styles.statValue}>{formatDistance(totalDistanceKm)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 시간</Text>
          <Text style={styles.statValue}>{formatDuration(elapsedSeconds)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>평균 페이스</Text>
          <Text style={styles.statValue}>{formatPace(avgPaceSecPerKm)} /km</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>최고 심박수</Text>
          <Text style={styles.statValue}>{maxHeartRate > 0 ? `${maxHeartRate}bpm` : '--'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>평균 심박수</Text>
          <Text style={styles.statValue}>{avgHeartRate > 0 ? `${avgHeartRate}bpm` : '--'}</Text>
        </View>
      </View>

      {/* Points */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>오늘 획득한 포인트</Text>
        <Text style={styles.pointsValue}>+{points.toLocaleString()}P</Text>
      </View>

      {/* AI coaching recap */}
      {messages.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI 코칭 기록</Text>
          {messages.slice(-3).map((m) => (
            <Text key={m.id} style={styles.coachingLine}>• {m.text}</Text>
          ))}
        </View>
      )}

      {/* Share card (off-screen render) */}
      <View
        ref={shareCardRef}
        style={styles.shareCard}
        pointerEvents="none"
      >
        <View style={styles.shareCardInner}>
          <Text style={styles.shareAppName}>런플</Text>
          <Text style={styles.shareUserName}>{name}</Text>
          <Text style={styles.shareDistance}>{formatDistance(totalDistanceKm)}</Text>
          <Text style={styles.sharePace}>{formatPace(avgPaceSecPerKm)} /km · {formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.sharePoints}>+{points.toLocaleString()}P 획득!</Text>
          <Text style={styles.shareTagline}>런플 앱으로 함께 달려요 🏃‍♂️</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
        <Text style={styles.shareButtonText}>📸 인스타 인증하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')} activeOpacity={0.85}>
        <Text style={styles.homeButtonText}>홈으로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },

  // Map
  mapCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    height: 240,
    position: 'relative',
  },
  map: { width: '100%', height: '100%' },
  markerStart: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markerEnd: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  mapBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mapBadgeText: { color: '#fff', fontSize: fontSizes.sm, fontWeight: '700' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  statLabel: { fontSize: fontSizes.md, color: colors.textSecondary },
  statValue: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  pointsCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pointsLabel: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.8)' },
  pointsValue: { fontSize: fontSizes.huge, fontWeight: '900', color: '#fff' },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  coachingLine: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, lineHeight: 20 },
  shareCard: {
    position: 'absolute',
    width: 1080,
    height: 1080,
    left: -2000,
    opacity: 0,
  },
  shareCardInner: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 80,
  },
  shareAppName: { fontSize: 48, fontWeight: '900', color: '#FF4D00', marginBottom: 20 },
  shareUserName: { fontSize: 36, color: '#fff', marginBottom: 30 },
  shareDistance: { fontSize: 160, fontWeight: '900', color: '#fff', lineHeight: 170 },
  sharePace: { fontSize: 40, color: '#9A9A9A', marginBottom: 20 },
  sharePoints: { fontSize: 60, fontWeight: '800', color: '#FF4D00', marginBottom: 30 },
  shareTagline: { fontSize: 32, color: '#5A5A5A' },
  shareButton: {
    backgroundColor: '#E1306C',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shareButtonText: { fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' },
  homeButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  homeButtonText: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text },
});
