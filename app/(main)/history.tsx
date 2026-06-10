import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useHistoryStore } from '../../src/stores/useHistoryStore';
import type { HistoryRun } from '../../src/types/history';
import { formatPace, formatDuration } from '../../src/utils/formatters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd} ${WEEKDAYS[d.getDay()]}요일`;
}

function calcCalories(distanceKm: number): number {
  return Math.round(65 * distanceKm * 1.036);
}

function getHRZoneInfo(avgHR: number): { label: string; color: string } {
  if (avgHR < 120) return { label: 'Zone 1 회복', color: '#4CAF50' };
  if (avgHR < 140) return { label: 'Zone 2 유산소', color: '#64B5F6' };
  if (avgHR < 160) return { label: 'Zone 3 페이스', color: '#FFA726' };
  if (avgHR < 175) return { label: 'Zone 4 역치', color: '#FF7043' };
  return { label: 'Zone 5 최대', color: colors.danger };
}

function getPostureColor(score: number): string {
  if (score >= 80) return colors.accent;
  if (score >= 60) return colors.warning;
  return colors.danger;
}

interface HRZonesData { z1: number; z2: number; z3: number; z4: number; z5: number }

function calcHRZones(hrHistory: number[]): HRZonesData {
  if (!hrHistory.length) return { z1: 0.05, z2: 0.25, z3: 0.45, z4: 0.20, z5: 0.05 };
  const total = hrHistory.length;
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;
  hrHistory.forEach(hr => {
    if (hr < 120) z1++;
    else if (hr < 140) z2++;
    else if (hr < 160) z3++;
    else if (hr < 175) z4++;
    else z5++;
  });
  return { z1: z1/total, z2: z2/total, z3: z3/total, z4: z4/total, z5: z5/total };
}

const HR_ZONES = [
  { key: 'z1' as const, label: '회복', color: '#4CAF50', range: '< 120bpm' },
  { key: 'z2' as const, label: '유산소', color: '#64B5F6', range: '120-140' },
  { key: 'z3' as const, label: '페이스', color: '#FFA726', range: '140-160' },
  { key: 'z4' as const, label: '역치', color: '#FF7043', range: '160-175' },
  { key: 'z5' as const, label: '최대', color: '#F44336', range: '> 175bpm' },
];

// ─── RunCard ──────────────────────────────────────────────────────────────────

function RunCard({ run, onPress }: { run: HistoryRun; onPress: () => void }) {
  const hrZone = getHRZoneInfo(run.avgHeartRate);
  const postureColor = getPostureColor(run.postureScore);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Card header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(run.date)}</Text>
        {run.goalAchieved
          ? <View style={styles.badgeGoal}><Text style={styles.badgeGoalText}>✅ 목표 달성</Text></View>
          : <View style={styles.badgeMiss}><Text style={styles.badgeMissText}>목표 미달</Text></View>
        }
      </View>

      {/* Main metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricBig}>{run.distanceKm.toFixed(2)}</Text>
          <Text style={styles.metricUnit}>km</Text>
        </View>
        <View style={styles.metricSep} />
        <View style={styles.metricBlock}>
          <Text style={styles.metricBig}>{formatDuration(run.durationSeconds)}</Text>
          <Text style={styles.metricUnit}>시간</Text>
        </View>
        <View style={styles.metricSep} />
        <View style={styles.metricBlock}>
          <Text style={styles.metricBig}>{formatPace(run.avgPaceSecPerKm)}</Text>
          <Text style={styles.metricUnit}>/km 평균</Text>
        </View>
      </View>

      {/* Heart rate row */}
      <View style={styles.hrRow}>
        <Text style={styles.hrText}>❤️  avg {run.avgHeartRate}bpm  ·  최대 {run.maxHeartRate}bpm</Text>
        <View style={[styles.hrZoneTag, { borderColor: hrZone.color + '80' }]}>
          <Text style={[styles.hrZoneTagText, { color: hrZone.color }]}>{hrZone.label}</Text>
        </View>
      </View>

      {/* Posture + Points row */}
      <View style={styles.cardFooter}>
        <Text style={styles.postureLabel}>자세</Text>
        <View style={styles.postureBarBg}>
          <View style={[styles.postureBarFill, { width: `${run.postureScore}%`, backgroundColor: postureColor }]} />
        </View>
        <Text style={[styles.postureNum, { color: postureColor }]}>{run.postureScore}</Text>
        <View style={styles.pointsTag}>
          <Text style={styles.pointsTagText}>+{run.pointsEarned.toLocaleString()}P</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail sub-components ────────────────────────────────────────────────────

function HRZoneBar({ zone, ratio }: { zone: typeof HR_ZONES[0]; ratio: number }) {
  return (
    <View style={styles.hrZoneBar}>
      <Text style={styles.hrZoneBarLabel}>{zone.label}</Text>
      <Text style={styles.hrZoneBarRange}>{zone.range}</Text>
      <View style={styles.hrZoneBarBg}>
        <View style={[styles.hrZoneBarFill, { width: `${Math.max(ratio * 100, 2)}%`, backgroundColor: zone.color }]} />
      </View>
      <Text style={styles.hrZoneBarPct}>{Math.round(ratio * 100)}%</Text>
    </View>
  );
}

function PostureBar({ label, score }: { label: string; score: number }) {
  const color = getPostureColor(score);
  return (
    <View style={styles.postureDetailRow}>
      <Text style={styles.postureDetailLabel}>{label}</Text>
      <View style={styles.postureDetailBg}>
        <View style={[styles.postureDetailFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.postureDetailNum, { color }]}>{score}</Text>
    </View>
  );
}

function SplitRow({ km, paceSecPerKm, goalPaceSec }: { km: number; paceSecPerKm: number; goalPaceSec: number }) {
  const diff = paceSecPerKm - goalPaceSec;
  const isFaster = diff <= 0;
  const isOnTarget = diff <= 15;
  const barColor = isFaster ? colors.accent : isOnTarget ? colors.warning : colors.primary;
  // Normalize bar width: 4:00 = 240s (full), 8:00 = 480s (empty)
  const barPct = Math.min(100, Math.max(5, Math.round(100 - ((paceSecPerKm - 240) / 240) * 100)));

  return (
    <View style={styles.splitRow}>
      <Text style={styles.splitKmLabel}>{km}km</Text>
      <Text style={styles.splitPaceLabel}>{formatPace(paceSecPerKm)}</Text>
      <View style={styles.splitBarBg}>
        <View style={[styles.splitBarFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.splitDiff, { color: isFaster ? colors.accent : colors.textMuted }]}>
        {diff === 0 ? '' : `${isFaster ? '-' : '+'}${Math.abs(diff)}s`}
      </Text>
    </View>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ run, onClose }: { run: HistoryRun; onClose: () => void }) {
  const zones = calcHRZones(run.hrHistory);
  const calories = calcCalories(run.distanceKm);
  const postureColor = getPostureColor(run.postureScore);

  return (
    <SafeAreaView style={styles.modalBg}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Modal header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{formatDate(run.date)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

        {/* Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewDist}>{run.distanceKm.toFixed(2)}km</Text>
          <Text style={styles.overviewMeta}>
            {formatDuration(run.durationSeconds)}  ·  avg {formatPace(run.avgPaceSecPerKm)} /km
          </Text>
          {run.goalAchieved
            ? <View style={styles.overviewBadgeGoal}>
                <Text style={styles.overviewBadgeGoalText}>✅  {run.goalDistanceKm}km 목표 달성!</Text>
              </View>
            : <View style={styles.overviewBadgeMiss}>
                <Text style={styles.overviewBadgeMissText}>
                  목표까지 {(run.goalDistanceKm - run.distanceKm).toFixed(2)}km 부족
                </Text>
              </View>
          }
          <Text style={styles.overviewPoints}>+{run.pointsEarned.toLocaleString()}P 획득</Text>
        </View>

        {/* Heart rate analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️  심박수 분석</Text>
          <View style={styles.hrStatRow}>
            <View style={styles.hrStatBlock}>
              <Text style={styles.hrStatValue}>{run.avgHeartRate}</Text>
              <Text style={styles.hrStatLabel}>평균 (bpm)</Text>
            </View>
            <View style={styles.hrStatSep} />
            <View style={styles.hrStatBlock}>
              <Text style={[styles.hrStatValue, run.maxHeartRate >= 175 && styles.hrStatDanger]}>
                {run.maxHeartRate}
              </Text>
              <Text style={styles.hrStatLabel}>최고 (bpm)</Text>
            </View>
            <View style={styles.hrStatSep} />
            <View style={styles.hrStatBlock}>
              <Text style={styles.hrStatValue}>{calories}</Text>
              <Text style={styles.hrStatLabel}>칼로리 (kcal)</Text>
            </View>
          </View>
          <Text style={styles.subLabel}>심박 구간 분포</Text>
          <View style={styles.hrZonesBox}>
            {HR_ZONES.map(zone => (
              <HRZoneBar key={zone.key} zone={zone} ratio={zones[zone.key]} />
            ))}
          </View>
        </View>

        {/* Running posture */}
        <View style={styles.section}>
          <View style={styles.postureHeaderRow}>
            <Text style={styles.sectionTitle}>🏃  러닝 자세 점수</Text>
            <Text style={[styles.postureScoreBig, { color: postureColor }]}>{run.postureScore}/100</Text>
          </View>
          <Text style={styles.subLabel}>항목별 점수</Text>
          <PostureBar label="페이스 일관성" score={run.paceConsistency} />
          <PostureBar label="심박 효율성" score={run.hrEfficiency} />
          <PostureBar label="리듬 안정성" score={run.rhythmStability} />
          <View style={styles.postureGuide}>
            <Text style={styles.postureGuideText}>
              {run.postureScore >= 80
                ? '👍 훌륭한 자세로 달렸어요! 페이스와 심박이 안정적이었어요.'
                : run.postureScore >= 60
                ? '💪 괜찮은 자세예요. 페이스 일관성을 조금 더 높여봐요.'
                : '📈 꾸준히 달리다 보면 자세도 좋아져요. 포기하지 마요!'}
            </Text>
          </View>
        </View>

        {/* Split paces */}
        {run.splitPaces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍  km별 페이스</Text>
            <Text style={styles.subLabel}>목표 {formatPace(run.goalPaceSecPerKm)} /km 기준</Text>
            {run.splitPaces.map(s => (
              <SplitRow
                key={s.km}
                km={s.km}
                paceSecPerKm={s.paceSecPerKm}
                goalPaceSec={run.goalPaceSecPerKm}
              />
            ))}
          </View>
        )}

        {/* Coaching messages */}
        {run.coachingMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖  AI 코칭 기록  ({run.coachingCount}회)</Text>
            {run.coachingMessages.map((msg, i) => (
              <View key={i} style={styles.coachRow}>
                <View style={styles.coachDot} />
                <Text style={styles.coachText}>{msg}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type FilterType = 'week' | 'month' | 'all';

export default function HistoryScreen() {
  const { runs } = useHistoryStore();
  const [filter, setFilter] = useState<FilterType>('month');
  const [selectedRun, setSelectedRun] = useState<HistoryRun | null>(null);
  const now = Date.now();

  const filteredRuns = useMemo(() => {
    if (filter === 'week') return runs.filter(r => now - r.date < 7 * 86_400_000);
    if (filter === 'month') {
      const d = new Date(now);
      return runs.filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
    }
    return runs;
  }, [runs, filter]);

  // Always compute current month stats for the summary banner
  const thisMonthRuns = useMemo(() => {
    const d = new Date(now);
    return runs.filter(r => {
      const rd = new Date(r.date);
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    });
  }, [runs]);

  const monthDist = thisMonthRuns.reduce((s, r) => s + r.distanceKm, 0);
  const monthAvgPace = thisMonthRuns.length
    ? Math.round(thisMonthRuns.reduce((s, r) => s + r.avgPaceSecPerKm, 0) / thisMonthRuns.length)
    : 0;
  const monthGoals = thisMonthRuns.filter(r => r.goalAchieved).length;
  const monthLabel = `${new Date(now).getMonth() + 1}월 요약`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>러닝 기록</Text>
        <Text style={styles.screenSub}>총 {runs.length}회 달렸어요 🏃</Text>
      </View>

      {/* Monthly summary banner */}
      {thisMonthRuns.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>{monthLabel}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBig}>{monthDist.toFixed(1)}</Text>
              <Text style={styles.summaryUnit}>km 총 거리</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBig}>{thisMonthRuns.length}</Text>
              <Text style={styles.summaryUnit}>회 러닝</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBig}>{monthGoals}/{thisMonthRuns.length}</Text>
              <Text style={styles.summaryUnit}>목표 달성</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBig}>{formatPace(monthAvgPace)}</Text>
              <Text style={styles.summaryUnit}>평균 페이스</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['week', 'month', 'all'] as FilterType[]).map(f => {
          const label = f === 'week' ? '이번 주' : f === 'month' ? '이번 달' : '전체';
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, active && styles.filterTabOn]}
              onPress={() => setFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextOn]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Run list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRuns.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏃</Text>
            <Text style={styles.emptyTitle}>이 기간에 기록이 없어요</Text>
            <Text style={styles.emptySub}>지금 바로 첫 런플을 시작해봐요!</Text>
          </View>
        ) : (
          filteredRuns.map(run => (
            <RunCard key={run.id} run={run} onPress={() => setSelectedRun(run)} />
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedRun}
        animationType="slide"
        onRequestClose={() => setSelectedRun(null)}
      >
        {selectedRun && (
          <DetailModal run={selectedRun} onClose={() => setSelectedRun(null)} />
        )}
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Screen header
  screenHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  screenSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Monthly summary
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  summaryCardTitle: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
  },
  summaryBig: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.text,
  },
  summaryUnit: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summarySep: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },

  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 3,
    gap: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  filterTabOn: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextOn: {
    color: '#fff',
  },

  // List
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  // Run card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardDate: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgeGoal: {
    backgroundColor: colors.accent + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeGoalText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.accent,
  },
  badgeMiss: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeMissText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricBig: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
  },
  metricUnit: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  hrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hrText: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  hrZoneTag: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hrZoneTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  postureLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    width: 22,
  },
  postureBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
  },
  postureBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  postureNum: {
    fontSize: 10,
    fontWeight: '800',
    width: 18,
    textAlign: 'right',
  },
  pointsTag: {
    backgroundColor: colors.primary + '1A',
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pointsTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyEmoji: { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  // ─── Modal ─────────────────────────────────────────────────────────────────

  modalBg: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: spacing.lg,
  },

  // Overview card
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewDist: {
    fontSize: 60,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 68,
  },
  overviewMeta: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  overviewBadgeGoal: {
    backgroundColor: colors.accent + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  overviewBadgeGoalText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  overviewBadgeMiss: {
    backgroundColor: colors.warning + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  overviewBadgeMissText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  overviewPoints: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // HR stats
  hrStatRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  hrStatBlock: {
    flex: 1,
    alignItems: 'center',
  },
  hrStatSep: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  hrStatValue: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
  },
  hrStatDanger: {
    color: colors.danger,
  },
  hrStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hrZonesBox: {
    gap: 6,
  },
  hrZoneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hrZoneBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    width: 36,
  },
  hrZoneBarRange: {
    fontSize: 10,
    color: colors.textMuted,
    width: 64,
  },
  hrZoneBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
  },
  hrZoneBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hrZoneBarPct: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 28,
    textAlign: 'right',
  },

  // Posture
  postureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postureScoreBig: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  postureDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 8,
  },
  postureDetailLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    width: 76,
  },
  postureDetailBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
  },
  postureDetailFill: {
    height: '100%',
    borderRadius: 3,
  },
  postureDetailNum: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    width: 24,
    textAlign: 'right',
  },
  postureGuide: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  postureGuideText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Split paces
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 8,
  },
  splitKmLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 28,
  },
  splitPaceLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
    width: 46,
    fontVariant: ['tabular-nums'],
  },
  splitBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
  },
  splitBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  splitDiff: {
    fontSize: 10,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },

  // Coaching messages
  coachRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  coachDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  coachText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
