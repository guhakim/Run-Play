import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Linking,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../src/constants/theme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useHistoryStore } from '../../src/stores/useHistoryStore';
import { formatPace } from '../../src/utils/formatters';

const TIER_THRESHOLDS = [
  { label: '브론즈', min: 0,    max: 50   },
  { label: '실버',   min: 50,   max: 200  },
  { label: '골드',   min: 200,  max: 500  },
  { label: '플래티넘', min: 500, max: 1000 },
  { label: '다이아', min: 1000, max: Infinity },
];

const BADGES = [
  { id: 'first',   emoji: '🏃', label: '첫 런플',   cond: (n: number) => n >= 1 },
  { id: '5km',     emoji: '5️⃣', label: '5km 완주',  cond: (_: number, d: number) => d >= 5 },
  { id: '10km',    emoji: '🔟', label: '10km 완주', cond: (_: number, d: number) => d >= 10 },
  { id: 'streak3', emoji: '🔥', label: '3일 연속',  cond: (_: number, __: number, s: number) => s >= 3 },
  { id: 'streak7', emoji: '🗓', label: '7일 연속',  cond: (_: number, __: number, s: number) => s >= 7 },
  { id: 'half',    emoji: '🏅', label: '하프마라톤', cond: (_: number, d: number) => d >= 21.0975 },
  { id: '100km',   emoji: '💯', label: '100km 달성', cond: (_: number, d: number) => d >= 100 },
];

function getTier(km: number) {
  return TIER_THRESHOLDS.findLast(t => km >= t.min) ?? TIER_THRESHOLDS[0];
}
function getTierProgress(km: number) {
  const t = getTier(km);
  if (t.max === Infinity) return 1;
  return Math.min((km - t.min) / (t.max - t.min), 1);
}
function getNextTier(km: number) {
  const idx = TIER_THRESHOLDS.findIndex((t, i) =>
    km >= t.min && (i === TIER_THRESHOLDS.length - 1 || km < TIER_THRESHOLDS[i + 1].min)
  );
  return idx < TIER_THRESHOLDS.length - 1 ? TIER_THRESHOLDS[idx + 1] : null;
}

export default function ProfileScreen() {
  const { name, streakDays } = useUserStore();
  const { runs } = useHistoryStore();

  const [notifOn, setNotifOn]         = useState(true);
  const [autoPauseOn, setAutoPauseOn] = useState(true);
  const [unitKm, setUnitKm]           = useState(true);

  const stats = useMemo(() => {
    const totalDist = runs.reduce((s, r) => s + r.distanceKm, 0);
    const totalPts  = runs.reduce((s, r) => s + r.pointsEarned, 0);
    const paces     = runs.map(r => r.avgPaceSecPerKm).filter(p => p > 0);
    const bestPace  = paces.length ? Math.min(...paces) : 0;
    return { totalDist, totalPts, bestPace, count: runs.length };
  }, [runs]);

  const tier = getTier(stats.totalDist);
  const progress = getTierProgress(stats.totalDist);
  const nextTier = getNextTier(stats.totalDist);
  const initial = name.trim().charAt(0).toUpperCase() || 'R';

  function handleSignOut() {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => {} },
    ]);
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => Alert.alert('오류', '링크를 열 수 없어요.'));
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* ── 유저 카드 ── */}
      <View style={s.userCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <View style={s.userInfo}>
          <Text style={s.userName}>{name}</Text>
          <Text style={s.userSub}>
            런플러 · {streakDays > 0 ? `${streakDays}일 연속 🔥` : '오늘 첫 런!'}
          </Text>
        </View>
      </View>

      {/* ── 통계 그리드 ── */}
      <View style={s.grid}>
        <View style={[s.cell, s.br, s.bb]}>
          <Text style={s.cellVal}>{stats.count}회</Text>
          <Text style={s.cellLab}>총 러닝</Text>
        </View>
        <View style={[s.cell, s.bb]}>
          <Text style={s.cellVal}>{stats.totalDist.toFixed(1)}km</Text>
          <Text style={s.cellLab}>총 거리</Text>
        </View>
        <View style={[s.cell, s.br]}>
          <Text style={[s.cellVal, { color: colors.primary }]}>
            {stats.totalPts.toLocaleString()}P
          </Text>
          <Text style={s.cellLab}>총 포인트</Text>
        </View>
        <View style={s.cell}>
          <Text style={s.cellVal}>
            {stats.bestPace > 0 ? formatPace(stats.bestPace) : '--:--'}
          </Text>
          <Text style={s.cellLab}>최고 페이스 /km</Text>
        </View>
      </View>

      {/* ── 등급 ── */}
      <View style={s.card}>
        <View style={s.tierRow}>
          <Text style={s.cardTitle}>🏅 런너 등급</Text>
          <View style={s.tierChip}>
            <Text style={s.tierChipText}>{tier.label} 러너</Text>
          </View>
        </View>
        {nextTier && (
          <Text style={s.tierSub}>
            {stats.totalDist.toFixed(1)}km · 다음 등급까지 {(nextTier.min - stats.totalDist).toFixed(1)}km
          </Text>
        )}
        <View style={s.track}>
          <View style={[s.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={s.tierEnds}>
          <Text style={s.tierEnd}>{tier.label} {tier.min}km</Text>
          {nextTier && <Text style={s.tierEnd}>{nextTier.label} {nextTier.min}km</Text>}
        </View>
      </View>

      {/* ── 배지 ── */}
      <Text style={s.label}>획득한 배지</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgeScroll} contentContainerStyle={{ paddingRight: spacing.lg }}>
        {BADGES.map(b => {
          const unlocked = b.cond(stats.count, stats.totalDist, streakDays);
          return (
            <View key={b.id} style={[s.badge, !unlocked && s.badgeLocked]}>
              <Text style={s.badgeEmoji}>{b.emoji}</Text>
              <Text style={s.badgeLab}>{b.label}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* ── 설정 ── */}
      <Text style={s.label}>설정</Text>
      <View style={s.card}>
        <Row icon="🔔" label="러닝 알림"
          right={<Switch value={notifOn} onValueChange={setNotifOn} trackColor={{ true: colors.primary }} thumbColor="#fff" />} />
        <View style={s.div} />
        <Row icon="⏸" label="자동 일시정지" sub="속도가 느려지면 자동으로 멈춤"
          right={<Switch value={autoPauseOn} onValueChange={setAutoPauseOn} trackColor={{ true: colors.primary }} thumbColor="#fff" />} />
        <View style={s.div} />
        <Row icon="📏" label="거리 단위"
          right={
            <TouchableOpacity onPress={() => setUnitKm(v => !v)} style={s.unitBtn}>
              <Text style={s.unitTxt}>{unitKm ? 'km' : 'mi'}</Text>
            </TouchableOpacity>
          } />
        <View style={s.div} />
        <Row icon="⌚" label="스마트워치 연결" sub="Apple Watch / Galaxy Watch" chevron
          onPress={() => Alert.alert('스마트워치', 'Apple Watch: HealthKit 연동\nGalaxy Watch: Google Fit 연동')} />
      </View>

      {/* ── 앱 정보 ── */}
      <Text style={s.label}>앱 정보</Text>
      <View style={s.card}>
        <Row icon="🛡" label="개인정보 처리방침" chevron onPress={() => openUrl('https://example.com/privacy')} />
        <View style={s.div} />
        <Row icon="📄" label="서비스 이용약관" chevron onPress={() => openUrl('https://example.com/terms')} />
        <View style={s.div} />
        <Row icon="ℹ️" label="앱 버전" right={<Text style={s.ver}>v0.1.0 MVP</Text>} />
        <View style={s.div} />
        <Row icon="💌" label="피드백 보내기" chevron
          onPress={() => Alert.alert('피드백', '소중한 의견을 보내주세요!\n\nkgh3274@gmail.com')} />
      </View>

      {/* ── 로그아웃 ── */}
      <TouchableOpacity style={s.signOut} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={s.signOutTxt}>로그아웃</Text>
      </TouchableOpacity>
      <Text style={s.footer}>런플 (Run-Play) · MZ세대를 위한 AI 러닝 코치</Text>
    </ScrollView>
  );
}

function Row({ icon, label, sub, right, chevron, onPress }: {
  icon: string; label: string; sub?: string;
  right?: React.ReactNode; chevron?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {right}
      {chevron ? <Text style={s.chevron}>›</Text> : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: 40 },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: fontSizes.xl, fontWeight: '900' },
  userInfo: { flex: 1 },
  userName: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  userSub: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 3 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  cell: { width: '50%', padding: spacing.md, alignItems: 'center' },
  cellVal: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text },
  cellLab: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  br: { borderRightWidth: 1, borderRightColor: colors.border },
  bb: { borderBottomWidth: 1, borderBottomColor: colors.border },

  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  label: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.xs },
  cardTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },

  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, marginBottom: 4 },
  tierChip: { backgroundColor: 'rgba(255,77,0,0.15)', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tierChipText: { color: colors.primary, fontSize: fontSizes.xs, fontWeight: '700' },
  tierSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  track: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  tierEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingBottom: spacing.md },
  tierEnd: { fontSize: fontSizes.xs, color: colors.textMuted },

  badgeScroll: { marginBottom: spacing.md },
  badge: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm, marginRight: spacing.sm, minWidth: 72, borderWidth: 1, borderColor: colors.border },
  badgeLocked: { opacity: 0.3 },
  badgeEmoji: { fontSize: 26, marginBottom: 4 },
  badgeLab: { fontSize: 10, fontWeight: '600', color: colors.text, textAlign: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textMuted },
  unitBtn: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  unitTxt: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  ver: { fontSize: fontSizes.sm, color: colors.textSecondary },
  div: { height: 1, backgroundColor: colors.border, marginLeft: 40 },

  signOut: { borderWidth: 1, borderColor: colors.danger, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  signOutTxt: { fontSize: fontSizes.md, fontWeight: '600', color: colors.danger },
  footer: { textAlign: 'center', fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing.sm },
});
