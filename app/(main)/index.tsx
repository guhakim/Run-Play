import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useHistoryStore } from '../../src/stores/useHistoryStore';
import { formatPace, formatDistance, formatDuration } from '../../src/utils/formatters';

const COACHING_MESSAGES = [
  '오늘 날씨 좋네요! 달리기 딱 좋은 날이에요. 목표를 설정하고 함께 달려볼까요? 🔥',
  '몸이 조금 무겁더라도 일단 신발을 신어봐요. 달리다 보면 가벼워질 거예요. 🏃',
  '어제보다 1km만 더 달려봐요. 그게 갓생이에요. ✨',
  '오늘도 런플과 함께 갓생을 만들어봐요! 렛츠 런플! 🔥',
  '규칙적인 러닝은 스트레스를 날려버려요. 오늘 러닝 어때요? 💪',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return '새벽에도 런플 👀';
  if (h < 12) return '좋은 아침이에요 ☀️';
  if (h < 18) return '오늘 오후도 런플 🏃';
  return '저녁 러닝 어때요? 🌙';
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()} ${days[d.getDay()]}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { name, streakDays } = useUserStore();
  const { runs } = useHistoryStore();

  const totalPoints = useMemo(() => runs.reduce((s, r) => s + r.pointsEarned, 0), [runs]);
  const lastRun = runs[0] ?? null;

  const coachMsg = COACHING_MESSAGES[new Date().getDay() % COACHING_MESSAGES.length];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* ── 헤더 ── */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.title}>
            {name}의 <Text style={{ color: colors.primary }}>런플</Text>
          </Text>
        </View>
        <View style={s.headerRight}>
          {streakDays > 0 && (
            <View style={s.streakBadge}>
              <Text style={s.streakText}>🔥 {streakDays}일</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── 스탯 카드 2개 ── */}
      <View style={s.statRow}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>총 포인트</Text>
          <Text style={[s.statValue, { color: colors.primary }]}>
            {totalPoints.toLocaleString()}P
          </Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>총 러닝</Text>
          <Text style={s.statValue}>{runs.length}회</Text>
        </View>
      </View>

      {/* ── AI 코칭 메시지 ── */}
      <View style={s.coachCard}>
        <Text style={s.coachLabel}>🤖 AI 페이스 코치</Text>
        <Text style={s.coachText}>"{coachMsg}"</Text>
      </View>

      {/* ── 워치 상태 ── */}
      <View style={s.watchRow}>
        <Text style={s.watchIcon}>⌚</Text>
        <View style={s.watchInfo}>
          <Text style={s.watchTitle}>워치 연결 대기 중</Text>
          <Text style={s.watchSub}>심박수 모니터링 준비 중...</Text>
        </View>
        <TouchableOpacity style={s.watchBtn}>
          <Text style={s.watchBtnText}>연결</Text>
        </TouchableOpacity>
      </View>

      {/* ── 마지막 러닝 ── */}
      {lastRun && (
        <>
          <Text style={s.sectionTitle}>마지막 러닝</Text>
          <View style={s.lastRunCard}>
            <View style={s.lastRunHeader}>
              <Text style={s.lastRunDate}>{formatDate(lastRun.date)}</Text>
              <View style={[s.goalBadge, lastRun.goalAchieved ? s.goalSuccess : s.goalFail]}>
                <Text style={[s.goalBadgeText, lastRun.goalAchieved ? s.goalSuccessText : s.goalFailText]}>
                  {lastRun.goalAchieved ? '✅ 목표 달성' : '목표 미달'}
                </Text>
              </View>
            </View>
            <View style={s.lastRunStats}>
              <View style={s.lrStat}>
                <Text style={s.lrVal}>{formatDistance(lastRun.distanceKm)}</Text>
                <Text style={s.lrLab}>거리</Text>
              </View>
              <View style={[s.lrStat, s.lrBorder]}>
                <Text style={s.lrVal}>{formatDuration(lastRun.durationSeconds)}</Text>
                <Text style={s.lrLab}>시간</Text>
              </View>
              <View style={s.lrStat}>
                <Text style={s.lrVal}>{formatPace(lastRun.avgPaceSecPerKm)}</Text>
                <Text style={s.lrLab}>/km 평균</Text>
              </View>
            </View>
            <View style={s.lastRunFooter}>
              <Text style={s.lrPts}>+{lastRun.pointsEarned}P 획득</Text>
              <Text style={s.lrPosture}>자세 점수 {lastRun.postureScore}/100</Text>
            </View>
          </View>
        </>
      )}

      {/* ── 시작 버튼 ── */}
      <TouchableOpacity
        style={s.startBtn}
        onPress={() => router.push('/run/setup')}
        activeOpacity={0.85}
      >
        <Text style={s.startText}>달리기 시작</Text>
        <Text style={s.startSub}>START RUNNING 🔥</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
  title: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text },
  headerRight: { alignItems: 'flex-end', paddingTop: 4 },
  streakBadge: { backgroundColor: 'rgba(255,77,0,0.15)', borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },

  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text },

  coachCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  coachLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  coachText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 20 },

  watchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  watchIcon: { fontSize: 24 },
  watchInfo: { flex: 1 },
  watchTitle: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  watchSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  watchBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  watchBtnText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '600' },

  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  lastRunCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  lastRunHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  lastRunDate: { fontSize: fontSizes.sm, color: colors.textSecondary },
  goalBadge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  goalSuccess: { backgroundColor: 'rgba(0,245,160,0.12)' },
  goalFail: { backgroundColor: colors.surfaceLight },
  goalBadgeText: { fontSize: fontSizes.xs, fontWeight: '700' },
  goalSuccessText: { color: colors.accent },
  goalFailText: { color: colors.textSecondary },
  lastRunStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  lrStat: { flex: 1, alignItems: 'center' },
  lrBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  lrVal: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },
  lrLab: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  lastRunFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  lrPts: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  lrPosture: { fontSize: fontSizes.sm, color: colors.textSecondary },

  startBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginTop: spacing.sm },
  startText: { fontSize: fontSizes.xxl, fontWeight: '900', color: '#fff' },
  startSub: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});
