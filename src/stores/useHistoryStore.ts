import { create } from 'zustand';
import type { HistoryRun, SplitPace } from '../types/history';

// ─── Demo runs (shown until user completes real runs) ─────────────────────────

const NOW = Date.now();
const DAY = 86_400_000;

const DEMO_RUNS: HistoryRun[] = [
  {
    id: 'demo-1',
    date: NOW - 2 * DAY,
    distanceKm: 5.02,
    durationSeconds: 1725,
    avgPaceSecPerKm: 344,
    maxHeartRate: 168,
    avgHeartRate: 152,
    goalDistanceKm: 5,
    goalPaceSecPerKm: 330,
    goalAchieved: true,
    pointsEarned: 567,
    postureScore: 82,
    paceConsistency: 85,
    hrEfficiency: 75,
    rhythmStability: 90,
    coachingCount: 4,
    coachingMessages: [
      '반가워요! 오늘 5km, 5분 30초 페이스로 달려볼게요. 렛츠 런플! 🔥',
      '1km 통과! 페이스 5분 20초로 조금 빠른 편이에요. 여유 있게 달려봐요.',
      '3km 통과! 현재 페이스 5분 45초 아주 안정적이에요. 이대로 가봐요!',
      '정말 멋져요! 5km 완주 성공! 오늘 목표를 완벽하게 정복했어요. 최고예요! 🎉',
    ],
    hrHistory: [
      120, 125, 130, 135, 140, 145, 148, 150, 152, 153, 154, 155, 156, 157, 158,
      159, 160, 158, 157, 156, 155, 154, 153, 152, 151, 150, 152, 154, 156, 158,
      160, 162, 160, 158, 156, 154, 153, 152, 151, 150, 152, 154, 156, 158, 160,
      162, 164, 166, 168, 165, 162, 158, 155, 152, 150, 148, 145, 142, 140,
    ],
    splitPaces: [
      { km: 1, paceSecPerKm: 320 },
      { km: 2, paceSecPerKm: 335 },
      { km: 3, paceSecPerKm: 348 },
      { km: 4, paceSecPerKm: 352 },
      { km: 5, paceSecPerKm: 365 },
    ],
  },
  {
    id: 'demo-2',
    date: NOW - 5 * DAY,
    distanceKm: 2.85,
    durationSeconds: 1020,
    avgPaceSecPerKm: 358,
    maxHeartRate: 162,
    avgHeartRate: 143,
    goalDistanceKm: 3,
    goalPaceSecPerKm: 360,
    goalAchieved: false,
    pointsEarned: 295,
    postureScore: 68,
    paceConsistency: 70,
    hrEfficiency: 65,
    rhythmStability: 70,
    coachingCount: 2,
    coachingMessages: [
      '반가워요! 오늘 3km 달려볼게요. 가볍게 출발해요! 🏃',
      '⏸ 잠깐! 속도가 많이 느려졌어요. 잠시 자동 일시정지 할게요. 호흡 고르고 다시 달려봐요.',
    ],
    hrHistory: [
      118, 122, 128, 133, 138, 142, 145, 147, 148, 149, 150, 151, 152,
      153, 152, 150, 148, 146, 144, 142, 140, 141, 143, 145, 148, 150,
      152, 154, 156, 158, 160, 162, 159, 155, 150, 145, 140, 135, 130,
    ],
    splitPaces: [
      { km: 1, paceSecPerKm: 345 },
      { km: 2, paceSecPerKm: 360 },
      { km: 3, paceSecPerKm: 375 },
    ],
  },
  {
    id: 'demo-3',
    date: NOW - 9 * DAY,
    distanceKm: 10.05,
    durationSeconds: 3540,
    avgPaceSecPerKm: 352,
    maxHeartRate: 175,
    avgHeartRate: 158,
    goalDistanceKm: 10,
    goalPaceSecPerKm: 360,
    goalAchieved: true,
    pointsEarned: 1120,
    postureScore: 78,
    paceConsistency: 75,
    hrEfficiency: 80,
    rhythmStability: 80,
    coachingCount: 6,
    coachingMessages: [
      '오늘 10km! 천천히 페이스 유지하면서 달려봐요. 렛츠 런플! 🔥',
      '2km 통과! 현재 페이스 5분 40초 완벽해요!',
      '5km 하프포인트! 체력 관리 잘 하고 있어요. 이대로 가봐요.',
      '⚠️ 경고! 심박수가 175bpm까지 올라갔어요. 안전이 제일 중요해요! 잠깐 페이스를 낮춰봐요.',
      '8km 통과! 마지막 2km 함께 달려봐요. 갓생 완주 가자! 🔥',
      '10km 완주!! 대단해요, 정말 갓생이에요! 🎊',
    ],
    hrHistory: [
      122, 128, 133, 138, 142, 146, 150, 153, 155, 157, 158, 159, 160,
      161, 160, 159, 158, 157, 156, 157, 158, 159, 160, 161, 162, 163,
      164, 163, 162, 161, 160, 161, 162, 163, 164, 165, 166, 167, 168,
      169, 170, 171, 172, 173, 174, 175, 173, 170, 167, 164, 161, 158,
      155, 153, 150, 148, 145, 143, 141, 140,
    ],
    splitPaces: [
      { km: 1, paceSecPerKm: 365 },
      { km: 2, paceSecPerKm: 340 },
      { km: 3, paceSecPerKm: 348 },
      { km: 4, paceSecPerKm: 352 },
      { km: 5, paceSecPerKm: 350 },
      { km: 6, paceSecPerKm: 355 },
      { km: 7, paceSecPerKm: 358 },
      { km: 8, paceSecPerKm: 356 },
      { km: 9, paceSecPerKm: 360 },
      { km: 10, paceSecPerKm: 368 },
    ],
  },
  {
    id: 'demo-4',
    date: NOW - 14 * DAY,
    distanceKm: 5.01,
    durationSeconds: 1680,
    avgPaceSecPerKm: 335,
    maxHeartRate: 165,
    avgHeartRate: 148,
    goalDistanceKm: 5,
    goalPaceSecPerKm: 330,
    goalAchieved: true,
    pointsEarned: 602,
    postureScore: 88,
    paceConsistency: 92,
    hrEfficiency: 82,
    rhythmStability: 90,
    coachingCount: 3,
    coachingMessages: [
      '반가워요! 오늘 5km, 5분 30초 페이스. 렛츠 런플! 🔥',
      '3km 통과! 5분 35초, 아주 일관적이에요! 갓생이에요.',
      '5km 완주 성공! 최고의 페이스 유지였어요! 🎉',
    ],
    hrHistory: [
      118, 122, 128, 133, 138, 142, 145, 147, 148, 149, 150, 150,
      151, 151, 150, 150, 149, 149, 150, 150, 151, 152, 153, 154,
      155, 155, 155, 154, 154, 153, 153, 155, 158, 160, 163, 165,
      163, 160, 157, 154, 151, 148, 145, 142, 140, 138, 135, 132,
    ],
    splitPaces: [
      { km: 1, paceSecPerKm: 330 },
      { km: 2, paceSecPerKm: 334 },
      { km: 3, paceSecPerKm: 336 },
      { km: 4, paceSecPerKm: 333 },
      { km: 5, paceSecPerKm: 340 },
    ],
  },
];

// ─── Posture computation ──────────────────────────────────────────────────────

function computePaceConsistency(paces: number[]): number {
  if (paces.length < 2) return 75;
  const avg = paces.reduce((a, b) => a + b, 0) / paces.length;
  const variance = paces.reduce((a, p) => a + (p - avg) ** 2, 0) / paces.length;
  const stdDev = Math.sqrt(variance);
  // stdDev 0s → 100pts, 60s+ → 0pts
  return Math.max(0, Math.min(100, Math.round(100 - (stdDev / 60) * 100)));
}

function computeHREfficiency(hrHistory: number[]): number {
  if (!hrHistory.length) return 70;
  const aerobic = hrHistory.filter(hr => hr >= 120 && hr < 160).length;
  return Math.round((aerobic / hrHistory.length) * 100);
}

// ─── Build HistoryRun from report screen data ─────────────────────────────────

export function buildHistoryRun(params: {
  distanceKm: number;
  durationSeconds: number;
  avgPaceSecPerKm: number;
  maxHeartRate: number;
  avgHeartRate: number;
  heartRateHistory: number[];
  targetDistanceKm: number;
  targetPaceSecPerKm: number;
  pointsEarned: number;
  coachingMessages: string[];
}): HistoryRun {
  const {
    distanceKm, durationSeconds, avgPaceSecPerKm, maxHeartRate, avgHeartRate,
    heartRateHistory, targetDistanceKm, targetPaceSecPerKm, pointsEarned, coachingMessages,
  } = params;

  const goalAchieved = distanceKm >= targetDistanceKm;
  const numKm = Math.max(1, Math.floor(distanceKm));

  // Synthesize split paces from avg with small variation
  const splitPaces: SplitPace[] = Array.from({ length: numKm }, (_, i) => ({
    km: i + 1,
    paceSecPerKm: Math.round(avgPaceSecPerKm + (Math.random() - 0.5) * 20),
  }));

  const paceConsistency = computePaceConsistency(splitPaces.map(s => s.paceSecPerKm));
  const hrEfficiency = computeHREfficiency(heartRateHistory);
  const rhythmStability = goalAchieved ? 90 : 65;
  const postureScore = Math.round((paceConsistency + hrEfficiency + rhythmStability) / 3);

  return {
    id: `run-${Date.now()}`,
    date: Date.now(),
    distanceKm,
    durationSeconds,
    avgPaceSecPerKm,
    maxHeartRate,
    avgHeartRate,
    goalDistanceKm: targetDistanceKm,
    goalPaceSecPerKm: targetPaceSecPerKm,
    goalAchieved,
    pointsEarned,
    postureScore,
    paceConsistency,
    hrEfficiency,
    rhythmStability,
    coachingCount: coachingMessages.length,
    coachingMessages,
    hrHistory: heartRateHistory,
    splitPaces,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface HistoryState {
  runs: HistoryRun[];
  addRun: (run: HistoryRun) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  runs: DEMO_RUNS,
  addRun: (run) => set((state) => ({ runs: [run, ...state.runs] })),
  clearHistory: () => set({ runs: DEMO_RUNS }),
}));
