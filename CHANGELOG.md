# CHANGELOG — 런플 (Run-Play) 개발 이력

> 모든 변경 사항을 날짜·커밋 기준으로 상세히 기록합니다.

---

## [v0.4.0] — 2026-06-10 · `bfc1cba`

### ✨ feat: 나이키 런클럽 방식 모션 감지 + 한국어 음성 코칭

**배경**
기존 프로토타입은 "달리기 시작" 버튼을 누르면 실제로 움직이지 않아도 거리가 자동으로 증가했다.
나이키 런클럽처럼 실제 움직임이 있을 때만 거리가 측정되도록 개선 요청.

**추가 기능**

| 항목 | 내용 |
|------|------|
| 📱 모션 감지 | `DeviceMotionEvent` 가속도계로 달리기/정지 실시간 감지 |
| ⏸ 자동 일시정지 | 3초 이상 정지 시 자동으로 타이머·거리 측정 중단 |
| ▶️ 자동 재개 | 다시 움직이면 자동으로 러닝 재개 (수동 조작 불필요) |
| 🏃 모션 상태 UI | 거리 표시 아래 `🏃 달리는 중` / `⏸ 정지 감지됨` 실시간 표시 |
| 💻 데스크탑 모드 | 센서 없을 때 "누르고 있으면 달리기" 버튼 자동 표시 |
| 📏 거리 계산 개선 | 완전 랜덤 → 목표 페이스 기준 정확한 계산 (±변동폭 추가) |
| 🔊 한국어 음성 | Web Speech API로 모든 AI 코칭 메시지 자동 TTS 발화 (ko-KR) |

**기술 구현 상세**
- `DeviceMotionEvent.requestPermission()` — iOS 13+ 권한 요청 처리
- `accelerationIncludingGravity` 벡터 크기에서 중력(9.81) 제거 → 동적 가속도 계산
- 15샘플 이동 평균으로 노이즈 제거, 임계값 1.2 m/s² 이상 시 "달리는 중" 판정
- `AUTO_PAUSE_FRAMES = 10` (10 × 300ms = 3초)
- 거리 계산: `distPerStep = (1 / effectivePace) * 0.3` km (300ms 간격)
- `SpeechSynthesisUtterance` lang=`ko-KR`, rate=1.05, 이모지 자동 제거

**변경 파일**
- `prototype.html` — activeScreen HTML, startRun(), fireCoaching(), endRun(), togglePause()

---

## [v0.3.3] — 2026-06-10 · `891968e`

### 📝 docs: 프로토타입 외부 공유 링크 README 추가

- `raw.githack.com` 기반 외부 접속 공유 링크 생성
- README.md 상단에 프로토타입 링크 및 8개 화면 소개 테이블 추가
- `vercel.json` 설정 파일 추가 (향후 Vercel 배포 대비)
- GitHub Pages `gh-pages` 브랜치 생성 (수동 Settings 활성화 필요)

**공유 링크**: https://raw.githack.com/guhakim/Run-Play/main/prototype.html

---

## [v0.3.2] — 2026-06-10 · `571822c`

### 🐛 fix: 기록/홈 탭 전환 시 스크롤 위치 버그 수정

**버그 원인**
스크린들이 일반 document flow(`display:flex`)로 렌더링되어 탭 전환 시 이전 스크롤 위치가 유지됨.
기록 탭을 열면 상단(헤더·배너·필터)이 아닌 중간(3번째 카드)부터 보이는 현상 발생.

**수정 내용**
- `.screen.active` CSS → `position:fixed; top:0; left:0; right:0; bottom:0; overflow-y:auto`
  - 각 스크린이 독립적인 뷰포트처럼 동작 → 스크롤 오염 없음
- `goTo()` 함수: `window.scrollTo(0,0)` → `target.scrollTop = 0`
  - 스크린 자체 스크롤 기준으로 항상 최상단에서 시작
- `openHistory()`, `goHome()` 동일하게 `scrollTop` 리셋 적용
- 모든 스크린의 불필요한 `min-h-screen` 클래스 제거

**변경 파일**
- `prototype.html` — CSS `.screen`, `goTo()`, `openHistory()`, `goHome()`

---

## [v0.3.1] — 2026-06-10 · `e9266f5`

### ✨ feat: 홈/프로필 화면 전면 개선 (React Native 앱)

#### 홈 화면 (`app/(main)/index.tsx`)

**기존**: 텍스트 4줄 + 시작 버튼만 있는 최소 UI

**개선 내용**
- 시간대별 인사말 (아침☀️ / 오후🏃 / 저녁🌙 / 새벽👀)
- 연속 기록 뱃지 (`🔥 N일`) 헤더 우측 표시
- 통계 카드 2개 (총 포인트 / 총 러닝 횟수) — `useHistoryStore`에서 실시간 집계
- AI 코칭 메시지 — 요일별 5개 로테이션 (주황 왼쪽 테두리 카드)
- 워치 연결 상태 카드 (연결 버튼 포함)
- **마지막 러닝 요약 카드**: 날짜, 목표달성 뱃지, 거리/시간/페이스, 획득 포인트, 자세 점수

#### 프로필 화면 (`app/(main)/profile.tsx`)

**기존**: 이름·포인트·연속기록만 표시하는 4줄 텍스트

**개선 내용**
- 아바타 원형 (이름 첫 글자 자동 생성) + 닉네임 + 연속 기록
- 통계 그리드 4개 — 총 러닝/총 거리/총 포인트/최고 페이스 (`useHistoryStore` 실시간 계산)
- **런너 등급 시스템**
  - 브론즈(0km) → 실버(50km) → 골드(200km) → 플래티넘(500km) → 다이아(1000km)
  - 현재 진행도 프로그레스 바 + "다음 등급까지 Nkm" 표시
- **배지 컬렉션 7종** — 조건 달성 시 자동 해제 (미달성 시 흐리게 표시)
  - 🏃 첫 런플 / 5️⃣ 5km 완주 / 🔟 10km 완주 / 🔥 3일 연속 / 🗓 7일 연속 / 🏅 하프마라톤 / 💯 100km
- **설정 섹션**: 러닝 알림 토글, 자동일시정지 토글, 거리 단위(km/mi), 워치 연결
- **앱 정보**: 개인정보처리방침, 이용약관, 버전 v0.1.0, 피드백
- 로그아웃 버튼 (확인 Alert 포함)

---

## [v0.3.0] — 2026-06-10 · `56d08a3`

### ✨ feat: 프로토타입에 프로필(Profile) 화면 추가

**배경**: 프로토타입의 프로필 탭 클릭 시 아무 동작 없음.

**추가 내용**
- 홈·기록 화면 하단 내비게이션 "프로필" 버튼 `onclick="openProfile()"`  연결
- `#profileOverlay` — `translateX(100%)` 슬라이드인 애니메이션 오버레이

**프로필 화면 구성**
| 섹션 | 내용 |
|------|------|
| 로그인 카드 (비로그인) | 앱 소개 + Google/Apple/게스트 로그인 버튼 |
| 로그인 카드 (로그인 후) | 아바타, 닉네임, 이메일, 편집 버튼 |
| 나의 통계 | 총 러닝/거리/포인트/최고 페이스 (실시간 집계) |
| 런너 등급 바 | 브론즈→실버→골드→플래티넘→다이아 |
| 배지 컬렉션 | 7종 (첫 런플/5km/10km/3일 연속 등) |
| 설정 | 알림 토글, AI 목소리 선택, 자동일시정지, 거리 단위, 워치 연결 |
| 앱 정보 | 개인정보처리방침, 이용약관, 버전, 피드백 |

**Google 로그인 시뮬레이션**
- 버튼 클릭 → 1.5초 로딩 → 로그인 완료 상태로 전환 (비로그인 카드 → 로그인 카드)
- 닉네임 수정 (`prompt()` 활용)

**추가 모달**
- 음성 선택 모달 (한국어 여성/남성/에너지 모드)
- 워치 연결 모달 (Apple Watch / Galaxy Watch / Garmin)
- 피드백 토스트

---

## [v0.2.0] — 2026-06-10 · `e69c710`

### ✨ feat: 프로토타입에 기록(History) 화면 추가

**배경**: 기록 탭 클릭 시 아무것도 보이지 않음.

**추가 내용**

**화면 구성**
| 요소 | 내용 |
|------|------|
| 6월 요약 배너 | 총 거리 17.9km / 3회 / 2/3 목표달성 / 평균 5′51″ |
| 필터 탭 | 이번 주 / 이번 달(기본) / 전체 — 탭 전환 시 카드 즉시 필터링 |
| 러닝 카드 | 날짜, 목표달성 뱃지, 거리/시간/페이스, 심박존 태그, 자세 바, 포인트 |
| 상세 오버레이 | 카드 클릭 → 하단 슬라이드업 → 전체 통계 보기 |

**상세 오버레이 내용**
- 개요 카드 (거리·시간·페이스·목표달성·포인트)
- 심박 구간 분포 (Zone 1~5 색상 바차트)
- 러닝 자세 3항목 (페이스 일관성 / 심박 효율성 / 리듬 안정성)
- km별 페이스 바차트 (목표 대비 색상: 빠름=초록, 비슷=노랑, 느림=주황)
- AI 코칭 메시지 목록

**데모 런 데이터 4개**
| 날짜 | 거리 | 목표 | 포인트 |
|------|------|------|--------|
| 06.08 일요일 | 5.02km | ✅ 5km | +567P |
| 06.05 목요일 | 2.85km | ❌ 3km | +295P |
| 06.01 일요일 | 10.05km | ✅ 10km | +1120P |
| 05.27 화요일 | 5.01km | ✅ 5km | +602P |

**런 완료 후 자동 저장**: 리포트 화면 이동 시 방금 한 러닝이 기록 탭 최상단에 자동 추가.

---

## [v0.1.2] — 2026-06-09 · `fd700f0`

### 🐛 fix: 기록 탭 클릭 시 앱 크래시 수정

**원인**
`zustand v5.0.14` + `persist` 미들웨어 + `AsyncStorage` 조합이 React Native 모듈 초기화 시 크래시 유발.
`useHistoryStore` 모듈 자체가 로드 실패 → `history.tsx` 렌더링 불가 → 탭 클릭 무반응.

**수정**
- `persist` 미들웨어 및 `AsyncStorage` import 전체 제거
- 단순 `create<HistoryState>((set) => ({...}))` 인메모리 스토어로 교체
- `Modal`의 `presentationStyle="pageSheet"` 제거 (iOS 전용 속성 → Android 크래시)

---

## [v0.1.1] — 2026-06-09 · `fb3a9a6`

### ✨ feat: 기록(History) 화면 UX/UI 전체 구현 (React Native 앱)

**신규 파일**
- `src/types/history.ts` — `HistoryRun`, `SplitPace` 인터페이스 정의
- `src/stores/useHistoryStore.ts` — Zustand 스토어 + `buildHistoryRun()` 변환 함수 + 데모 데이터 4개

**`app/(main)/history.tsx` 전면 재작성**

```
화면 구조:
┌─ 월별 요약 배너 (총 거리/횟수/목표달성/평균 페이스)
├─ 필터 탭 [이번 주 | 이번 달 | 전체]
└─ 러닝 카드 목록
   └─ 터치 → 상세 모달 (Modal, animationType="slide")
```

**상세 모달 구성**
- 개요 카드 (달성 여부 강조)
- 심박수 구간 분포 (Zone별 컬러 바 + 퍼센트)
- 자세 점수 (`postureScore = (paceConsistency + hrEfficiency + rhythmStability) / 3`)
- km별 페이스 분할 바차트
- AI 코칭 메시지 타임라인

**`app/run/report.tsx` 수정**
- `useEffect`로 러닝 완료 시 `useHistoryStore.addRun()` 1회 호출
- `buildHistoryRun()` 으로 RunStore → HistoryRun 변환 후 저장

---

## [v0.1.0] — 2026-06-08 · `651b7e6`

### 🚀 feat: 런플(Run-Play) MVP 전체 구현

**프로젝트 초기 설정**
- Expo SDK 56, React Native, TypeScript strict
- Expo Router 파일 기반 라우팅 (`app/` 디렉터리)
- Zustand v5 상태 관리
- Supabase Edge Functions (Deno) — Claude API 프록시

**구현된 화면 (6개)**

| 화면 | 파일 | 주요 기능 |
|------|------|-----------|
| 홈 | `app/(main)/index.tsx` | 포인트/연속기록 표시, 달리기 시작 버튼 |
| 목표 설정 | `app/run/setup.tsx` | 거리 칩 선택, 페이스 슬라이더 |
| 러닝 중 | `app/run/active.tsx` | 실시간 GPS·심박·페이스, AI 코칭 토스트, 자동 일시정지 |
| 완주 | `app/run/finish.tsx` | 완주 메시지, 리포트 이동 |
| 갓생 리포트 | `app/run/report.tsx` | 통계, 포인트 계산, 인스타 공유 카드 |
| 기록 | `app/(main)/history.tsx` | (기본 플레이스홀더 — v0.1.1에서 전면 개선) |

**서비스 레이어**

| 서비스 | 파일 | 역할 |
|--------|------|------|
| GPS | `LocationService.ts` | expo-location 백그라운드 추적 |
| 페이스 계산 | `PaceCalculator.ts` | 30초 슬라이딩 윈도우 |
| 심박수 | `HealthKitService.ts` / `GoogleFitService.ts` | iOS/Android 폴링 |
| AI 코칭 | `CoachingOrchestrator.ts` | 7가지 트리거 큐 관리 |
| TTS | `TTSService.ts` | expo-speech 우선순위 큐 |
| API | `coachingProxy.ts` | Supabase Edge Function 호출 |
| 공유 | `ShareCardService.ts` | ViewShot + expo-sharing |

**AI 코칭 트리거 시스템 (7가지)**

| 트리거 | 조건 | 쿨다운 |
|--------|------|--------|
| `START_RUN` | 시작 버튼 | 세션당 1회 |
| `DISTANCE_MILESTONE` | 매 1km 통과 | km별 1회 |
| `OVER_PACE_WARNING` | 목표보다 15초/km 이상 빠를 때 | 120초 |
| `HIGH_HEART_RATE_ALERT` | 심박수 ≥ 180bpm | 60초 |
| `AUTO_PAUSE` | GPS 속도 < 0.5m/s × 3회 | 이벤트마다 |
| `GOAL_NEAR` | 목표까지 500m 남음 | 세션당 1회 |
| `FINISH_RUN` | 목표 거리 달성 | 세션당 1회 |

**포인트 계산식**
```
기본  = floor(달린거리km × 100)
페이스 보너스 = 목표 이내 +20% / 목표+30초 이내 +10% / 초과 +0%
완주 보너스  = +50 (목표 달성 시)
심박 안정 보너스 = maxHR < 180bpm → +15
연속 기록 배수 = 1.0 + (min(연속일수, 7) × 0.05)  // 최대 +35%
최종 = floor((기본 + 보너스) × 연속배수)
```

**Supabase DB 스키마**
- `run_sessions` — 러닝 요약 (거리/시간/페이스/심박/포인트)
- `gps_points` — GPS 좌표 배열 (30초 배치 저장)
- `coaching_logs` — AI 코칭 메시지 이력

**HTML 프로토타입** (`prototype.html`)
- 680줄 단일 파일, Tailwind CSS CDN
- 6개 화면 완전 동작 (홈→설정→카운트다운→러닝→완주→리포트)
- 러닝 시뮬레이션 (가속→페이스 랜덤 변동→심박수 상승)
- 7가지 AI 코칭 트리거 시뮬레이션

---

## 개발 환경

| 항목 | 버전/값 |
|------|---------|
| Node.js | v20+ |
| Expo SDK | 56.0.0 |
| React Native | 0.76 |
| TypeScript | 5.x strict |
| Zustand | 5.0.14 |
| Claude | Sonnet 4.6 |
| Supabase | Edge Functions (Deno) |

## 로컬 프로토타입 실행

```bash
python3 -m http.server 3000 --directory dist
# → http://localhost:3000/prototype.html
```

## 외부 공유 링크

**https://raw.githack.com/guhakim/Run-Play/main/prototype.html**
