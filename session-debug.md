# 로그인 세션 초기화 문제 분석

> Expo Go에서 코드 수정 후 앱 리로드 시 로그인 상태가 풀리는 현상

---

## 현상

- Expo Go 실행 중 코드를 수정하면 Fast Refresh 또는 전체 리로드(R키)가 발생
- 리로드 후 로그인 화면으로 튕겨나가거나, 앱이 초기화된 상태로 돌아옴
- 분명히 로그인한 상태였는데 세션이 사라짐

---

## 세션이 유지되려면 어떤 조건이 필요한가

앱이 리로드되면 JS 메모리는 전부 초기화됩니다.  
따라서 세션(로그인 토큰)은 **영속 저장소(AsyncStorage, MMKV 등)** 에 저장되어 있어야 하고,  
앱이 다시 시작될 때 저장소에서 읽어와서 복원해야 합니다.

아래 흐름이 정상 동작해야 세션이 유지됩니다:

```
[로그인] → Supabase가 토큰을 저장소에 저장
[리로드] → JS 메모리 초기화
[앱 재시작] → getSession() 호출 → 저장소에서 토큰 읽기 → 세션 복원
```

---

## 원인 후보 체크

### ❌ 후보 1 — Supabase `persistSession` 설정 누락

`lib/supabase.ts`에 `persistSession: true`가 명시되어 있음.  
→ Supabase 자체 설정 문제는 **아님**.

```ts
// lib/supabase.ts
auth: {
  storage: resolveStorage(),
  autoRefreshToken: true,
  persistSession: true,   // ← 정상
  detectSessionInUrl: false,
}
```

---

### ❌ 후보 2 — `getSession()` 실패 시 user=null 처리

`authStore.ts`의 `initialize()` 안에서 `getSession()`이 실패하면 `.catch()`에서 `user: null, isInitialized: true`를 세팅하고,  
네비게이션 가드가 즉시 로그인 화면으로 이동시킴.

```ts
// stores/authStore.ts
supabase.auth.getSession()
  .then(({ data: { session } }) => {
    set({ user: session?.user ?? null, isInitialized: true });
  })
  .catch(() => {
    set({ user: null, isInitialized: true }); // ← 네트워크 에러 등으로 실패 시 로그아웃
  });
```

이 자체가 문제이기보다는, **getSession()이 null을 반환하는 근본 이유**가 따로 있음.  
→ 증상이지 원인은 **아님**.

---

### ❌ 후보 3 — TOKEN_REFRESH_FAILED → 자동 SIGNED_OUT

Supabase는 토큰 갱신 실패 시 자동으로 `SIGNED_OUT` 이벤트를 발생시킴.  
`onAuthStateChange` 핸들러가 이를 처리하지 않으면 의도치 않게 로그아웃됨.

현재 코드에는 이미 처리 로직이 있음:

```ts
// stores/authStore.ts
if ((event as string) === 'TOKEN_REFRESH_FAILED') {
  _ignoreNextSignedOut = true;
  return;
}
if (event === 'SIGNED_OUT' && _ignoreNextSignedOut) {
  _ignoreNextSignedOut = false;
  return; // ← 자동 SIGNED_OUT 무시
}
```

→ 이미 수정된 부분, **현재는 문제 없음**.

---

### ✅ 후보 4 (핵심 원인) — MMKV가 Expo Go에서 실제로 저장하지 않는데, 저장하는 것처럼 보임

**이것이 세션이 사라지는 실제 원인입니다.**

#### 배경

`react-native-mmkv` v4는 **Nitro Modules** 기반으로, 네이티브 모듈(Development Build 이상)이 있어야 실제로 파일에 데이터를 저장함.

Expo Go는 네이티브 모듈을 직접 설치할 수 없어 MMKV는 실제로 작동하지 않음.

#### 문제 흐름

이 문제를 막기 위해 이전에 자가 테스트 코드를 추가했음:

```ts
// lib/mmkv.ts (현재)
_storage.set(TEST_KEY, 'ok');
_isWorking = _storage.getString(TEST_KEY) === 'ok';
_storage.remove(TEST_KEY);
```

하지만 **자가 테스트에 구조적 한계가 있음:**

| 상황 | set() | getString() | 결과 |
|------|-------|-------------|------|
| 네이티브 정상 작동 | 파일 저장 | 파일에서 읽기 | `'ok'` → `_isWorking = true` ✅ |
| **Expo Go (문제 상황)** | **JS 메모리에만 저장** | **JS 메모리에서 읽기** | `'ok'` → `_isWorking = true` ❌ |
| 완전히 실패 | 에러 or null | 에러 or null | `undefined` → `_isWorking = false` ✅ |

자가 테스트는 **같은 JS 세션 안에서** 실행됨.  
MMKV가 JS 메모리에만 임시 저장해도 테스트는 통과함.  
결국 `mmkvStorageAdapter`가 non-null → Supabase가 MMKV를 사용.

#### 결과

```
[로그인] → Supabase가 MMKV(JS 메모리)에 토큰 저장
[코드 수정] → Fast Refresh 또는 전체 리로드
[JS 메모리 초기화] → MMKV에 저장했던 토큰 소멸
[getSession() 호출] → MMKV에 토큰 없음 → null 반환
[isInitialized=true, user=null] → 네비게이션 가드 → 로그인 화면으로 이동
```

---

### ⚠️ 부수 문제 — MMKV v4 API 불일치 (`remove` vs `delete`)

`react-native-mmkv` v4의 정식 API는 `.delete(key)`.  
현재 코드는 `.remove(key)`를 사용 중:

```ts
// lib/mmkv.ts 현재 코드 (잘못된 메서드명)
_storage.remove(TEST_KEY);         // 자가 테스트
_storage!.remove(key);             // removeItem 어댑터
```

Expo Go에서는 MMKV가 비활성화되므로 문제 없지만,  
향후 Development Build로 전환 시 로그아웃(`removeItem`) 동작이 에러를 발생시킬 수 있음.

---

## 요약

| 원인 | 심각도 | 상태 |
|------|--------|------|
| MMKV가 Expo Go에서 JS 메모리에만 저장 (자가 테스트 우회됨) | 🔴 높음 | **미해결** |
| TOKEN_REFRESH_FAILED → 자동 SIGNED_OUT | 🟡 중간 | ✅ 수정 완료 |
| MMKV v4 `.remove()` vs `.delete()` API 불일치 | 🟠 낮음 (현재 환경 무관) | **미해결** |

---

## 근본적 해결 방향

**Expo Go 환경을 명시적으로 감지해서 AsyncStorage를 강제 사용해야 함.**

현재 자가 테스트 방식은 in-memory 저장을 감지하지 못하므로,  
환경 감지 방식으로 교체하는 것이 유일한 확실한 해결책.

```
Expo Go 감지 방법:
- expo-constants의 Constants.executionEnvironment 값 확인
- 'storeClient' → Expo Go → AsyncStorage 강제 사용
- 그 외 → MMKV 사용 시도
```

수정 요청 시 위 방향으로 `lib/mmkv.ts`와 `lib/supabase.ts`를 수정하면 됩니다.
