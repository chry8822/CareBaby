# CareBaby 개발 이력 (CHANGELOG)

> 작업 기준일: 2026-02-26  
> 스택: Expo SDK 54 · expo-router v6 · React Native 0.81 · Supabase · TypeScript Strict · Zustand

---

## Phase 1 — 기반 인프라 & 인증 ✅ 완료

### 핵심 작업
- Expo Router v6 기반 네비게이션 구조 설계 (`_layout.tsx` / Stack / Tabs)
- TypeScript strict 모드 + 프로젝트 컨벤션 확립
- **Supabase** 연동 (Auth, DB, Storage)
- **MMKV** 네이티브 스토리지 + AsyncStorage 자동 폴백 구조 (`lib/mmkv.ts`)
- `SafeAreaProvider` + `initialWindowMetrics` 설정으로 초기 레이아웃 안정화

### 추가된 기능
| 항목 | 내용 |
|------|------|
| 로그인 화면 | 이메일/비밀번호 로그인, 소셜 로그인 UI (Apple·Google) |
| 회원가입 화면 | 이메일 가입 + 표시 이름 입력 |
| 인증 가드 | `isInitialized` 플래그로 세션 확인 전 라우팅 차단 |
| 디자인 시스템 | `constants/theme.ts` — 컬러, 타이포그래피, 스페이싱, 그림자 토큰 |
| 공통 UI | `AppModal`, `Toast`, `Button`, `PageHeader` |

### 아키텍처 결정
- 인증 상태: Zustand `authStore` (in-memory) + Supabase 세션을 AsyncStorage/MMKV에 자동 영속화
- 네비게이션: `(auth)` 그룹 / `(tabs)` 그룹 분리

---

## Phase 2 — 핵심 기능 구현 ✅ 완료

### 핵심 작업
- 4탭 바텀 네비게이션 구성 (홈 / 기록 / 통계 / 설정)
- 수유·수면·기저귀 기록 CRUD
- 홈 대시보드 전체 구현
- **오프라인 퍼스트** 아키텍처 — 네트워크 없을 때 로컬 큐에 저장 후 자동 동기화

### 추가된 기능

#### 홈 탭 (`app/(tabs)/index.tsx`)
| 항목 | 내용 |
|------|------|
| 타이머 카드 | 마지막 수유·수면·기저귀로부터 경과 시간 실시간 표시 (1초 갱신) |
| 오늘 요약 | 수유 횟수 · 총 수면 시간 · 기저귀 횟수 한 줄 요약 |
| AI 인사이트 카드 | UI 자리 확보 완료, 실제 AI 로직은 Phase 4에서 구현 |
| 타임라인 | 오늘 기록 전체를 시간 역순으로 표시 |
| 빠른 기록 버튼 | 수평 스크롤 버튼 → 해당 카테고리 기록탭으로 딥링크 |
| Pull-to-Refresh | 당겨서 데이터 갱신 |
| 아기 미등록 상태 | `BabySetupPrompt` — 온보딩 유도 화면 |
| 광고 배너 영역 | Phase 7 AdMob 연동 자리 예약 |

#### 기록 탭 (`app/(tabs)/record.tsx`)
| 항목 | 내용 |
|------|------|
| 수유 기록 (`FeedingForm`) | 모유(좌/우)/유축/분유 선택, 타이머 모드, 직접 입력 모드, 수유량(ml), 빠른 메모 Chip, 커스텀 메모 |
| 수면 기록 (`SleepForm`) | 시작/종료 시간, 타이머, 수면 품질 선택 |
| 기저귀 기록 (`DiaperForm`) | 종류(소변/대변/혼합/없음), 메모 |
| 내부 탭 네비게이션 | 수유·수면·기저귀·성장·건강·더보기 (성장/건강/더보기는 Coming Soon UI) |
| 홈 딥링크 | `?category=feeding` 파라미터로 특정 탭 바로 열기 |

#### 타이머 (`hooks/useTimer.ts`)
- 시작 / 일시정지 / 재개 / 중단 / 초기화
- **AppState 처리**: 앱이 백그라운드 → 포그라운드 복귀 시 경과 시간 자동 재계산
- `WheelTimePicker` — 커스텀 휠 스크롤 시간 선택기

#### 기록 저장 (`stores/recordStore.ts`)
- `saveFeeding` / `saveSleep` / `saveDiaper`: upsert 방식 (멱등성 보장)
- **오프라인 지원**: 저장 실패 시 `pendingSync` 큐에 쌓고 AsyncStorage/MMKV에 영속화
- `syncPending`: 앱 시작 시 미동기화 기록 일괄 업로드
- `deleteRecord`: 기록 삭제
- `getTimelineForDate`: 날짜별 타임라인 정렬

#### 아기 프로필 (`stores/babyStore.ts`)
- 아기 등록 (`createBaby`)
- 초대 코드 생성 (`generateInviteCode`) / 참여 (`joinByInviteCode`)
- 케어테이커 목록 조회

#### 통계 탭
- Coming Soon 플레이스홀더 UI — Phase 5에서 실제 차트 구현 예정

#### 설정 탭
- 프로필 카드 (표시 이름, 계정 정보)
- 로그아웃 (확인 모달)
- 알림 설정 / 개인정보처리방침 — Phase 6에서 연결 예정

---

## Phase 2.1 — 버그 수정 ✅ 완료

> 2026-02-26

### 수정된 버그

#### 탭 이동 시 레이어 쉬프팅
- **원인 A**: React Navigation `BottomTabBar`가 내부적으로 `useSafeAreaInsets()`로 `paddingBottom`을 자동 추가하는데, `tabBarStyle`에도 수동으로 `paddingBottom: insets.bottom`을 설정해서 bottom inset이 이중 적용됨
- **원인 B**: 탭 스크린의 Lazy 렌더링 — 각 탭 최초 방문 시 컴포넌트 마운트가 일어나며 레이아웃 계산이 탭 전환 애니메이션과 겹쳐 시각적 쉬프팅 발생

- **수정**: `safeAreaInsets={{ bottom: 0 }}` 을 `<Tabs>`에 추가 (내부 자동 처리 비활성화)
- **수정**: `lazy: false` 를 `screenOptions`에 추가 (앱 시작 시 모든 탭 미리 렌더링)

#### 앱 리로드 시 로그인 풀림
- **원인 A**: Supabase 토큰 갱신 실패(`TOKEN_REFRESH_FAILED`) 후 자동으로 `SIGNED_OUT` 이벤트가 연이어 발생, 기존 코드가 이를 차단하지 못해 `user: null` 설정됨
- **원인 B**: `getSession()` 실패 시 `.catch()` 없어서 `isInitialized`가 영원히 `false`로 남아 앱이 무한 로딩 상태에 빠질 수 있었음

- **수정**: `_ignoreNextSignedOut` 플래그로 `TOKEN_REFRESH_FAILED` 직후 자동 `SIGNED_OUT` 이벤트 차단
- **수정**: `getSession()`.catch() 추가 — 실패 시 `user: null, isInitialized: true`로 안전하게 로그인 화면으로 이동

---

## Phase 3 — Realtime 동기화 🔲 예정

### 계획된 작업
- Supabase Realtime 채널 구독 (`feedings` / `sleeps` / `diapers`)
- 다중 기기(부모·조부모 등) 동시 기록 시 홈 화면 자동 갱신
- `useHomeData.ts`의 주석 처리된 Realtime 구독 코드 활성화

---

## Phase 4 — AI 인사이트 🔲 예정

### 계획된 작업
- 수유·수면 패턴 분석 (7일 평균, 이상 패턴 감지)
- `useHomeData`의 `insight: null` 을 실제 AI 분석 결과로 교체
- Edge Function 또는 클라이언트 사이드 분석 로직

---

## Phase 5 — 통계 차트 🔲 예정

### 계획된 작업
- 수유·수면·기저귀 일별/주별 차트 (VictoryNative 또는 D3 기반)
- 추세선, 일별 비교, 목표 달성률

---

## Phase 6 — 알림 & 설정 확장 🔲 예정

### 계획된 작업
- `expo-notifications` 기반 수유/수면/기저귀 교체 알림
- 알림 간격 사용자 설정
- 프로필 편집 (표시 이름, 아바타)
- 아기 프로필 관리 화면 (수정, 케어테이커 관리)

---

## Phase 7 — 수익화 🔲 예정

### 계획된 작업
- AdMob 배너 광고 (홈 하단 예약 영역 연결)
- 프리미엄 플랜 결제 (`premium_expires_at` 필드 활용)

---

## 현재 상태 요약

```
Phase 1  ████████████████████  ✅ 완료
Phase 2  ████████████████████  ✅ 완료
Phase 2.1████████████████████  ✅ 완료 (버그 수정)
Phase 3  ░░░░░░░░░░░░░░░░░░░░  🔲 예정 (Realtime)
Phase 4  ░░░░░░░░░░░░░░░░░░░░  🔲 예정 (AI 인사이트)
Phase 5  ░░░░░░░░░░░░░░░░░░░░  🔲 예정 (통계 차트)
Phase 6  ░░░░░░░░░░░░░░░░░░░░  🔲 예정 (알림 & 설정)
Phase 7  ░░░░░░░░░░░░░░░░░░░░  🔲 예정 (수익화)
```
