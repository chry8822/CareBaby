> Expo SDK 52 · expo-router v3 · TypeScript Strict · Offline-First · 보안 강화

---

## 🤖 CURSOR 필수 규칙 (모든 작업에 우선 적용)

** 내용물은 한글로 작성(사용자는 한국인)\***

1. **파일 생성 순서 엄수**: config → design-system → core → features → app (순서 어기면 import 에러 발생)
2. **@package.json 먼저 확인** → 이미 설치된 패키지 절대 재설치 금지
3. **import 경로**: 절대경로 `@/` 사용 (tsconfig.json paths 기반)
4. **TypeScript**: strict 모드, `any` 타입 사용 금지 → 반드시 명시적 타입 선언
5. **에러 발생 시**: 즉시 해당 파일 + 에러 내용 + 수정 코드 제공
6. **네이티브 모듈 사용 시**: EAS Build 필요 여부 주석으로 명시
7. **모든 데이터는 로컬 우선 저장** (오프라인 퍼스트) → 네트워크 의존 코드 금지

---

## 📋 STEP 1: 프로젝트 초기화 (터미널에서 순서대로 실행)

```bash
# 1. 프로젝트 생성
npx create-expo-app@latest CareBaby --template blank-typescript
cd CareBaby

# 2. 코어 패키지
npx expo install expo-router@^3.5.0 \
  react-native-safe-area-context \
  react-native-screens \
  expo-linking \
  expo-status-bar \
  expo-constants

# 3. 데이터 & 보안
npx expo install expo-sqlite \
  expo-secure-store \
  @react-native-async-storage/async-storage \
  zustand@^4.5.0

# 4. UI & 애니메이션
npx expo install nativewind@^4.0.1 \
  tailwindcss@^3.4.0 \
  react-native-reanimated@^3.15.0 \
  react-native-gesture-handler@^2.20.0 \
  moti@^3.2.0 \
  lucide-react-native

# 5. 차트 (victory-native v40은 d3-shape 내장 → 별도 설치 불필요)
npx expo install victory-native@^40.0.0

# 6. 기능 패키지
npx expo install expo-notifications \
  expo-speech \
  expo-local-authentication \
  expo-av

# 7. 개발 의존성 (drizzle은 마이그레이션 생성 전용)
npm i -D @types/react@^18.3.0 \
  drizzle-orm@^0.36.0 \
  drizzle-kit@^0.28.0
```

> ⚠️ `@types/react-native`은 설치하지 않는다. Expo SDK 52는 react-native 내장 타입을 사용한다.
> ⚠️ `d3-shape`는 별도 설치하지 않는다. victory-native v40+에 내장되어 있다.

---

## ⚙️ STEP 2: 설정 파일 생성 (정확히 이 내용으로)

### 2-1. tsconfig.json

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
    },
  },
  "include": ["**/*.ts", "**/*.tsx", "src/**/*", "app/**/*"],
}
```

### 2-2. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 2-3. babel.config.js

```js
// ❌ nativewind/babel 프리셋 넣지 않는다 (v4에서는 metro에서 처리)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

### 2-4. metro.config.js

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 2-5. global.css (프로젝트 루트)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2-6. app.json 수정 (expo-router 활성화)

```jsonc
{
  "expo": {
    "name": "CareBaby",
    "slug": "CareBaby",
    "scheme": "carebaby",
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FFB6C1",
        },
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "아기 데이터 보호를 위해 Face ID를 사용합니다.",
        },
      ],
    ],
    "experiments": {
      "typedRoutes": true,
    },
  },
}
```

---

## 📁 STEP 3: 폴더 구조 + 생성 순서

아래 순서대로 파일을 생성한다. 순서를 바꾸면 import 에러 발생.

```
CareBaby/
├── global.css                          # (STEP 2-5에서 생성 완료)
├── app/
│   ├── _layout.tsx                     # [7] 루트 레이아웃
│   ├── index.tsx                       # [8] 앱 진입점 (→ 생체인증 게이트)
│   └── (tabs)/
│       ├── _layout.tsx                 # [9] 바텀탭 레이아웃
│       ├── home.tsx                    # [10] 메인 대시보드
│       ├── tracking.tsx               # [11] 기록 입력
│       └── stats.tsx                  # [12] 통계/차트
├── src/
│   ├── design-system/
│   │   ├── tokens.ts                  # [1] 디자인 토큰 (컬러, 스페이싱, 타이포)
│   │   └── theme.ts                   # [2] 테마 정의 (라이트/다크)
│   ├── core/
│   │   ├── database/
│   │   │   ├── client.ts              # [3] expo-sqlite + drizzle-orm 연결
│   │   │   └── schema.ts             # [4] 테이블 스키마
│   │   ├── security/
│   │   │   └── secure-storage.ts     # [5] expo-secure-store 래퍼
│   │   └── error/
│   │       └── ErrorBoundary.tsx      # [6] 에러 바운더리
│   ├── features/
│   │   ├── tracking/
│   │   │   ├── types.ts               # [13] 트래킹 타입 정의
│   │   │   ├── store.ts              # [14] zustand 스토어
│   │   │   ├── hooks/
│   │   │   │   └── useTracking.ts    # [15] 트래킹 커스텀 훅
│   │   │   └── components/
│   │   │       └── TrackingInput.tsx  # [16] 스와이프 입력 컴포넌트
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── CountdownTimer.tsx # [17] 실시간 카운트다운
│   │   │   │   ├── DailyChart.tsx     # [18] 패스텔 원형 차트
│   │   │   │   └── PatternCard.tsx    # [19] 패턴 분석 카드
│   │   │   └── hooks/
│   │   │       └── usePatternAnalysis.ts # [20] 7일 평균 분석
│   │   └── notifications/
│   │       └── useNotifications.ts    # [21] 알림 훅
│   └── shared/
│       ├── components/
│       │   └── SafeView.tsx           # [22] SafeAreaView 래퍼
│       └── utils/
│           └── date.ts                # [23] 날짜 유틸리티
```

---

## 🔒 STEP 4: 보안 아키텍처 (민감 데이터 = 아기 건강정보)

### 보안 전략 요약

| 데이터 종류                  | 저장소                    | 암호화                             |
| ---------------------------- | ------------------------- | ---------------------------------- |
| 앱 설정, 테마                | AsyncStorage              | 불필요                             |
| 아기 프로필 (이름, 생년월일) | expo-secure-store         | OS 레벨 암호화 (Keychain/Keystore) |
| 수유/수면/기저귀 기록        | expo-sqlite (drizzle-orm) | SQLite WAL 모드 + 앱 샌드박스      |
| 생체인증 토큰                | expo-secure-store         | OS 레벨 암호화                     |

### secure-storage.ts 핵심 구현

```typescript
// src/core/security/secure-storage.ts
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  BABY_PROFILE: 'carebaby_profile',
  AUTH_TOKEN: 'carebaby_auth',
  ENCRYPTION_KEY: 'carebaby_enc_key',
} as const;

type SecureKey = (typeof KEYS)[keyof typeof KEYS];

export const secureStorage = {
  async set(key: SecureKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async get(key: SecureKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async remove(key: SecureKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
```

### 생체인증 게이트 (앱 진입 시)

```typescript
// app/index.tsx 에서 사용
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticate(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return true; // 생체인증 미지원 시 패스

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '수호의 데이터를 보호하고 있어요 🔒',
    fallbackLabel: '비밀번호 사용',
    cancelLabel: '취소',
  });

  return result.success;
}
```

---

## 🗄️ STEP 5: 데이터베이스 (Drizzle + expo-sqlite)

### client.ts — DB 연결 (Expo 환경 전용)

```typescript
// src/core/database/client.ts
// ❌ better-sqlite3 사용 금지 (Node.js 전용)
// ✅ expo-sqlite adapter 사용
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('carebaby.db', { enableChangeListener: true });

// WAL 모드 활성화 (성능 + 동시 읽기)
expoDb.execSync('PRAGMA journal_mode = WAL;');

export const db = drizzle(expoDb, { schema });
```

### schema.ts — 테이블 정의

```typescript
// src/core/database/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const feedings = sqliteTable('feedings', {
  id: text('id').primaryKey(), // uuid
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['breast_left', 'breast_right', 'bottle', 'formula'] }).notNull(),
  durationMinutes: integer('duration_minutes'),
  amountMl: real('amount_ml'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sleeps = sqliteTable('sleeps', {
  id: text('id').primaryKey(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  quality: text('quality', { enum: ['deep', 'light', 'interrupted'] }),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const diapers = sqliteTable('diapers', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['wet', 'dirty', 'mixed', 'dry'] }).notNull(),
  color: text('color'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 타입 export
export type Feeding = typeof feedings.$inferSelect;
export type NewFeeding = typeof feedings.$inferInsert;
export type Sleep = typeof sleeps.$inferSelect;
export type NewSleep = typeof sleeps.$inferInsert;
export type Diaper = typeof diapers.$inferSelect;
export type NewDiaper = typeof diapers.$inferInsert;
```

### drizzle.config.ts (마이그레이션 생성 전용 — 런타임에서 사용 안 함)

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/core/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
} satisfies Config;
```

---

## 🎨 STEP 6: 디자인 시스템

### tokens.ts

```typescript
// src/design-system/tokens.ts
export const colors = {
  // 파스텔 톤 — 육아 앱 특화
  primary: '#FFB6C1', // 연한 핑크
  secondary: '#B5EAD7', // 민트
  accent: '#FFDAC1', // 피치
  warning: '#FFE066', // 옐로우
  info: '#C7CEEA', // 라벤더

  // 차트 전용
  chart: {
    feeding: '#FFB6C1',
    sleep: '#B5EAD7',
    diaper: '#FFDAC1',
    background: '#F8F9FA',
  },

  // 시맨틱
  text: {
    primary: '#2D3436',
    secondary: '#636E72',
    muted: '#B2BEC3',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    card: '#FFFFFF',
  },
  border: '#E9ECEF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  display: 40,
} as const;
```

---

## 📱 STEP 7: 핵심 기능 구현 세부사항

### 7-1. home.tsx (메인 대시보드)

구현해야 할 컴포넌트:

- **실시간 카운트다운 타이머**: 마지막 수유/수면/기저귀 교체로부터 경과 시간 표시
  - `useEffect` + `setInterval(1000ms)` + cleanup
  - 형식: "2시간 15분 전" → 점점 색상 변화 (정상 → 주의 → 경고)
- **오늘의 요약 카드**: 수유 횟수, 총 수면시간, 기저귀 교체 횟수
- **패스텔 원형 차트**: VictoryPie (v40 API)
  ```typescript
  // victory-native v40 API 사용
  import { VictoryPie } from 'victory-native';
  // ❌ victory-native/src/... 경로 import 금지
  // ❌ Svg import 불필요 (v40에서 자체 처리)
  ```
- **빠른 기록 버튼**: 탭 한 번으로 기록 (GestureHandler + Moti scale 애니메이션)
- **ErrorBoundary로 감싸기**: 차트 렌더링 실패 시 폴백 UI 표시

### 7-2. tracking.tsx (기록 입력)

- **스와이프 입력**: PanGestureHandler로 좌우 스와이프 → 수유/수면/기저귀 타입 전환
- **타이머 모드**: 수유/수면 시작/종료 기록
- **즉시 저장**: 입력 즉시 SQLite에 저장 (네트워크 불필요)
- **햅틱 피드백**: 기록 완료 시 (expo-haptics 사용 가능하면)

### 7-3. stats.tsx (통계)

- **7일 평균 패턴 분석**: zustand selector로 계산
  ```typescript
  // zustand selector 패턴 — 불필요한 리렌더 방지
  const weeklyAverage = useTrackingStore((state) => calculateWeeklyAverage(state.feedings));
  ```
- **트렌드 라인 차트**: VictoryLine + VictoryArea
- **일별 비교**: 어제 vs 오늘

---

## 🔔 STEP 8: 알림

```typescript
// expo-notifications만 사용 (notifee는 Expo 미지원)
import * as Notifications from 'expo-notifications';

// 알림 카테고리
const NOTIFICATION_TYPES = {
  FEEDING_REMINDER: 'feeding_reminder', // 수유 간격 알림
  SLEEP_REMINDER: 'sleep_reminder', // 수면 패턴 알림
  DIAPER_REMINDER: 'diaper_reminder', // 기저귀 교체 알림
} as const;

// 권한 요청은 앱 첫 실행 시 한 번만
// 알림 스케줄링: 마지막 기록 시간 기준 + 사용자 설정 간격
```

---

## 🛡️ STEP 9: ErrorBoundary (필수)

```typescript
// src/core/error/ErrorBoundary.tsx
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CareBaby Error]', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            문제가 발생했어요 😢
          </Text>
          <Text style={{ fontSize: 14, color: '#636E72', marginBottom: 24, textAlign: 'center' }}>
            잠시 후 다시 시도해주세요
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{ backgroundColor: '#FFB6C1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
```

---

## 📱 STEP 10: 앱 레이아웃

### app/\_layout.tsx (루트)

```typescript
// 반드시 포함할 것:
// 1. ErrorBoundary로 전체 앱 감싸기
// 2. global.css import
// 3. SafeAreaProvider
// 4. GestureHandlerRootView
// 5. expo-router Stack 또는 Slot

import '../global.css'; // NativeWind v4 필수
```

### app/(tabs)/\_layout.tsx (바텀탭)

```typescript
// expo-router v3 Tabs API 사용
import { Tabs } from 'expo-router';
import { Home, PenLine, BarChart3 } from 'lucide-react-native';

// 탭 3개: 홈(대시보드), 기록, 통계
// 탭 아이콘: lucide-react-native
// 탭바 스타일: 패스텔 톤, 라운드 모서리
```

---

## ✅ STEP 11: 최종 검증 체크리스트

생성 완료 후 아래 항목 모두 확인:

```bash
# 1. 빌드 검증
npx expo start --clear

# 2. TypeScript 컴파일 에러 0개 확인
npx tsc --noEmit
```

- [ ] TypeScript strict 모드 에러 0개
- [ ] NativeWind 클래스명이 실제 스타일로 적용되는지 확인
- [ ] SQLite 데이터 저장 → 앱 재시작 후 데이터 유지 확인
- [ ] 생체인증 프롬프트 정상 표시
- [ ] VictoryPie 차트 렌더링 정상
- [ ] 바텀탭 네비게이션 정상 작동
- [ ] ErrorBoundary 폴백 UI 표시 (의도적 에러 throw로 테스트)
- [ ] 오프라인 상태에서 모든 기능 정상 작동

---

## 🚨 금지 사항 (Cursor가 절대 하지 말아야 할 것)

- ❌ `better-sqlite3`, `sql.js` 등 Node.js 전용 SQLite 드라이버 사용
- ❌ `@types/react-native` 설치
- ❌ `d3-shape` 별도 설치
- ❌ `nativewind/babel` 바벨 프리셋 추가
- ❌ `notifee` 사용 (Expo 미지원)
- ❌ Node.js `crypto` 모듈 import
- ❌ `any` 타입 사용
- ❌ 네트워크 요청에 의존하는 데이터 저장
- ❌ `victory-native/src/...` 내부 경로 import
- ❌ `localStorage` 또는 `window` 객체 접근 (React Native 환경)
- ❌ 생체인증 없이 앱 진입 허용 (기기 미지원 시에만 패스)
