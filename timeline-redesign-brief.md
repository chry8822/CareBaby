# 타임라인 전체 기록 조회 기능 개선 브리프

> 집에서 이어서 작업하기 위한 컨텍스트 파일

---

## 작업 배경

- 현재 앱은 **오늘 날짜 기록만** 조회하도록 하드코딩되어 있음
- 새 폰으로 로그인하면 Supabase에 기록이 있어도 오늘이 아니면 안 보임
- 벤치마킹 앱(BabyTime)처럼 **전체 기록을 날짜/월 기준으로 볼 수 있어야 함**

---

## 원하는 UX

```
홈 화면
├── 상단: 아기 정보 + 타이머 카드 (최신 기록 기준, 날짜 무관 — 현재 유지)
└── 하단: 기록 타임라인
         ├── 기본: 전체 기록 (날짜별 그룹)
         ├── 월 선택 필터 (2025년 2월 ▾)
         └── 특정 날짜 선택 시 해당 날 기록만 표시
```

```
[2025년 2월 ▾]           ← 월 선택 드롭다운
────────────────────
2월 26일 (오늘)
  오전 06:30  수유 15분
  오전 09:00  기저귀
────────────────────
2월 25일
  오후 02:00  낮잠 1시간
  오전 07:00  수유 20분
────────────────────
...
```

---

## 변경 대상 파일 및 작업 내용

### 1. `hooks/useHomeData.ts`
- 현재: `getTodayStart()` 기준 오늘만 조회
- 변경: `selectedMonth` 파라미터 추가 (기본값: 현재 월)
  - 해당 월 전체 기록 조회 (`>= 월 시작일`, `< 다음 월 시작일`)
  - 타이머 카드용 lastFeeding/lastSleep/lastDiaper는 **날짜 무관 최신 1건** 별도 조회
  - `todaySummary`는 오늘 기준 유지 (상단 요약 텍스트용)

```ts
// 변경 전
const todayStart = getTodayStart();

// 변경 후 (selectedMonth: Date 파라미터)
const monthStart = `${year}-${month}-01T00:00:00`;
const monthEnd = `${nextYear}-${nextMonth}-01T00:00:00`;
```

---

### 2. `components/home/HomeDashboard.tsx`
- 월 선택 드롭다운 UI 추가 (타임라인 섹션 상단)
- `selectedMonth` state → `useHomeData`에 전달
- 월 변경 시 데이터 재조회

---

### 3. `components/home/TimelineList.tsx`
- 현재: 단순 리스트 (5개 프리뷰 + 전체보기 모달)
- 변경: **날짜별 그룹핑**

```
변경 후 구조:
- "오늘의 기록" 헤더 제거
- 날짜 헤더로 그룹핑 (오늘/어제/날짜 표시)
- 전체 스크롤 (모달 없이)
- 5개 프리뷰 + 전체보기 모달 로직 제거
```

```tsx
// 날짜별 그룹핑 예시
{
  "2025-02-26": [item1, item2, item3],
  "2025-02-25": [item4, item5],
}
```

---

### 4. `app/(tabs)/index.tsx`
- 변경 없음 (useHomeData 내부에서 처리)

---

## 현재 파일 구조 (읽은 파일 목록)

| 파일 | 줄 수 | 주요 내용 |
|---|---|---|
| `hooks/useHomeData.ts` | 279 | 오늘 기록 fetch, 타이머 elapsed, Realtime 구독 |
| `components/home/HomeDashboard.tsx` | 146 | 헤더 + 타이머카드 + 요약 + TimelineList |
| `components/home/TimelineList.tsx` | 153 | 5개 프리뷰 + 전체보기 모달 |
| `components/home/TimelineItemCard.tsx` | 198 | 개별 기록 카드 UI |
| `app/(tabs)/index.tsx` | 113 | HomeScreen, QuickRecordSheet |
| `stores/recordStore.ts` | 375 | 오프라인 pending 포함 기록 저장/조회 |

---

## 작업 순서

```
[1/4] useHomeData.ts
  - selectedMonth 파라미터 추가
  - 월 전체 기록 조회로 변경
  - lastFeeding/lastSleep/lastDiaper는 별도로 최신 1건 조회 (날짜 무관)

[2/4] TimelineList.tsx
  - 날짜별 그룹핑 로직 추가
  - 날짜 헤더 UI (오늘/어제/M월 D일)
  - 프리뷰 5개 제한 + 전체보기 모달 제거

[3/4] HomeDashboard.tsx
  - selectedMonth state 추가
  - 월 선택 UI (이전/다음 월 이동 버튼 or 드롭다운)
  - useHomeData에 selectedMonth 전달

[4/4] 확인 및 테스트
  - 월 이동 시 데이터 재조회 확인
  - 날짜 그룹핑 정상 표시 확인
```

---

## 시작 방법

이 파일을 AI에게 전달하고 아래처럼 요청:

```
이 브리프 기반으로 타임라인 전체 기록 조회 기능 작업 시작해줘.
1단계 useHomeData.ts부터 진행해줘.
```

---

*작성일: 2026-02-26*
*프로젝트: CareBaby (C:\Users\USER\Desktop\chrys\CareBaby)*
