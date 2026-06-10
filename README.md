# 런플 (Run-Play) 🏃

> MZ세대를 위한 AI 러닝 코치 앱 — 달리는 동안 Claude가 실시간으로 코칭해줘요

## 🔗 인터랙티브 프로토타입 (외부 공유 링크)

> 앱 설치 없이 브라우저에서 바로 체험할 수 있어요!

**👉 [https://raw.githack.com/guhakim/Run-Play/main/prototype.html](https://raw.githack.com/guhakim/Run-Play/main/prototype.html)**

| 화면 | 내용 |
|------|------|
| 🏠 홈 | 통계 카드, AI 코칭 메시지, 마지막 러닝 요약 |
| 🎯 목표 설정 | 거리 선택 + 페이스 슬라이더 |
| ⏱ 카운트다운 | 3·2·1·달려! |
| 🏃 러닝 중 | 실시간 거리/페이스/심박수 시뮬레이션, AI 코칭 토스트 |
| 🎉 완주 | 완주 메시지 |
| 📊 갓생 리포트 | 포인트 계산, 코칭 기록, 인스타 공유 |
| 📋 기록 | 필터(이번주/이번달/전체), 러닝 카드, 상세 오버레이 |
| 👤 프로필 | 통계, 등급, 배지, 설정, Google 로그인 시뮬레이션 |

---

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?logo=supabase)](https://supabase.com)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-D97757?logo=anthropic)](https://anthropic.com)

---

## 📱 앱 소개

런플은 스마트워치의 심박수 + GPS 데이터를 분석해서, 달리는 중에 AI가 이어폰으로 한국어 코칭 멘트를 전달하는 앱입니다.

```
달리기 시작 → GPS/심박 감지 → Claude AI 분석 → 한국어 음성 코칭 → 갓생 리포트 → 인스타 공유
```

### 핵심 기능

| 기능 | 설명 |
|------|------|
| 🎯 **목표 설정** | 거리(1~21km) + 목표 페이스 슬라이더 |
| 📍 **실시간 GPS** | 30초 슬라이딩 윈도우 페이스 계산, 자동 일시정지 |
| ❤️ **심박수 연동** | iOS HealthKit / Android Google Fit 폴링 |
| 🤖 **AI 음성 코칭** | Claude Sonnet 4.6 → expo-speech TTS |
| 📊 **갓생 리포트** | 포인트 계산 + 인스타그램 공유 카드 |

---

## 🤖 AI 코칭 시스템 (7가지 트리거)

| 트리거 | 발동 조건 | 쿨다운 |
|--------|-----------|--------|
| `START_RUN` | 러닝 시작 | 세션당 1회 |
| `DISTANCE_MILESTONE` | 매 1km 통과 | km별 1회 |
| `OVER_PACE_WARNING` | 목표 페이스보다 15초/km 이상 빠를 때 | 120초 |
| `HIGH_HEART_RATE_ALERT` | **심박수 ≥ 180bpm** (최우선 인터럽트) | 60초 |
| `AUTO_PAUSE` | GPS 속도 < 0.5m/s × 3회 연속 | 이벤트마다 |
| `GOAL_NEAR` | 목표까지 500m 남음 | 세션당 1회 |
| `FINISH_RUN` | 목표 거리 달성 | 세션당 1회 |

> `HIGH_HEART_RATE_ALERT`는 다른 TTS를 즉시 중단하고 최우선 출력합니다.

---

## 🏗️ 기술 스택

```
Frontend        React Native (Expo SDK 56) + TypeScript
Navigation      Expo Router (파일 기반 라우팅)
State           Zustand
GPS             expo-location (포그라운드 + 백그라운드)
Health          react-native-health (HealthKit) / react-native-google-fit
AI              Claude Sonnet 4.6 via Supabase Edge Function
TTS             expo-speech (한국어 ko-KR)
DB/Auth         Supabase (PostgreSQL + Edge Functions)
Share           react-native-view-shot + expo-sharing
```

---

## 📁 프로젝트 구조

```
Run-Play/
├── app/                          # Expo Router 화면
│   ├── (main)/
│   │   ├── index.tsx             # 홈 화면
│   │   ├── history.tsx           # 러닝 기록
│   │   └── profile.tsx           # 프로필
│   └── run/
│       ├── setup.tsx             # 목표 설정 (거리 + 페이스)
│       ├── active.tsx            # 러닝 화면 (핵심)
│       ├── finish.tsx            # 완주 + 쿨다운
│       └── report.tsx            # 갓생 리포트 + 공유
├── src/
│   ├── services/
│   │   ├── gps/
│   │   │   ├── LocationService.ts     # GPS 추적 (foreground + background)
│   │   │   └── PaceCalculator.ts      # 30초 슬라이딩 윈도우
│   │   ├── health/
│   │   │   ├── HealthKitService.ts    # iOS 심박수 (mock 모드 지원)
│   │   │   └── GoogleFitService.ts    # Android 심박수
│   │   ├── coaching/
│   │   │   ├── TriggerEngine.ts       # 7가지 트리거 평가 + 쿨다운
│   │   │   ├── CoachingOrchestrator.ts # AI 요청 큐 관리
│   │   │   └── TTSService.ts          # 우선순위 TTS 큐
│   │   ├── api/
│   │   │   ├── supabaseClient.ts      # Supabase 클라이언트
│   │   │   └── coachingProxy.ts       # Edge Function 호출
│   │   └── share/
│   │       └── ShareCardService.ts    # 인스타 공유 카드 생성
│   ├── stores/
│   │   ├── useRunStore.ts             # 상태 머신 (IDLE→ACTIVE→PAUSED→FINISHED)
│   │   ├── useGoalStore.ts            # 목표 거리/페이스
│   │   ├── useCoachingStore.ts        # AI 코칭 이력
│   │   └── useUserStore.ts            # 인증 + 포인트
│   ├── hooks/
│   │   ├── useGPSTracking.ts          # GPS 구독 + 페이스/거리 계산
│   │   ├── useHeartRate.ts            # 심박수 플랫폼별 폴링
│   │   ├── useAutoPause.ts            # 자동 일시정지
│   │   └── useCoaching.ts             # 트리거 평가 훅
│   ├── types/
│   │   ├── run.ts                     # RunStatus, GPSPoint, RunSession
│   │   ├── coaching.ts                # CoachingTrigger, TRIGGER_PRIORITY
│   │   └── health.ts                  # HeartRateReading
│   ├── constants/
│   │   ├── coaching.ts                # 트리거 임계값, 쿨다운
│   │   ├── points.ts                  # 포인트 계산식
│   │   └── theme.ts                   # 색상, 폰트, 간격
│   └── utils/
│       ├── formatters.ts              # formatPace, formatDistance, formatDuration
│       └── haversine.ts               # GPS 거리 계산
└── supabase/
    ├── functions/
    │   └── coaching-proxy/index.ts    # Claude API 프록시 (Deno Edge Function)
    └── migrations/
        ├── 001_users.sql              # profiles 테이블
        ├── 002_run_sessions.sql       # run_sessions 테이블
        ├── 003_gps_points.sql         # gps_points 테이블
        └── 004_coaching_logs.sql      # coaching_logs 테이블
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase 계정
- Anthropic API 키

### 설치

```bash
# 레포 클론
git clone https://github.com/guhakim/Run-Play.git
cd Run-Play

# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 키 입력 (아래 환경변수 섹션 참고)
```

### 환경변수 (`.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 개발 시 하드웨어 없이 심박수 테스트
EXPO_PUBLIC_MOCK_HEART_RATE=true
```

### Supabase Edge Function 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# Edge Function 배포
supabase functions deploy coaching-proxy

# Claude API 키 시크릿 설정
supabase secrets set ANTHROPIC_API_KEY=your-key
```

### DB 마이그레이션

```bash
supabase db push
```

### 앱 실행

```bash
# iOS 시뮬레이터
npx expo run:ios

# Android 에뮬레이터
npx expo run:android

# 실기기 (Expo Go)
npx expo start
```

---

## 💰 포인트 계산식

```
기본        = floor(달린거리km × 100)
페이스 보너스 = 목표 이내: +20% / 목표+30초 이내: +10%
완주 보너스  = +50P (목표 달성 시)
심박 안정   = maxHR < 180bpm → +15P
연속 배수   = 1.0 + (min(연속일, 7) × 0.05)  // 최대 +35%

최종 = floor((기본 + 보너스) × 연속배수)
```

---

## 🗄️ DB 스키마

```sql
profiles        -- 유저 프로필, 포인트, 연속 기록
run_sessions    -- 러닝 세션 요약 (거리, 시간, 페이스, 심박, 포인트)
gps_points      -- GPS 좌표 배열 (30초마다 배치 저장)
coaching_logs   -- AI 코칭 발화 이력
```

---

## 🔐 보안

- Claude API 키는 **Supabase Edge Function 환경변수에만** 존재
- 클라이언트는 Supabase JWT만 전송
- Edge Function이 JWT 검증 후 Claude API 호출
- Row Level Security (RLS) 전 테이블 적용

---

## 📱 인터랙티브 프로토타입

HTML 프로토타입 (`dist/prototype.html`) — 모든 화면과 AI 코칭 시뮬레이션 포함:

```bash
python3 -m http.server 3000 --directory dist
# → http://localhost:3000/prototype.html
```

---

## 🗺️ 로드맵

- [x] Phase 0: 프로젝트 초기화, 타입/상수/스토어 정의
- [x] Phase 1: GPS 추적, 페이스 계산, 러닝 화면
- [x] Phase 2: AI 코칭 시스템 (TriggerEngine + Claude + TTS)
- [x] Phase 3: HealthKit/GoogleFit 심박수 연동
- [x] Phase 4: 갓생 리포트 + 포인트 + 인스타 공유
- [ ] Phase 5: Supabase Auth + 러닝 기록 히스토리
- [ ] Phase 6: TestFlight 배포 + 실 기기 5km 테스트
- [ ] Phase 7: Apple Watch 네이티브 앱 (WatchKit)
- [ ] Phase 8: 런플 포인트 상점

---

## 🧑‍💻 개발자

**guhakim** — 런플 창업자/대표

---

## 📄 라이선스

MIT
