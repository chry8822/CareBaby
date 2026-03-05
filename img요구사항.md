# 앱 이미지 스타일 가이드

## 기존 앱 이미지 스타일 (신규 이미지 통일 필수)

- chibi baby character illustration (치비 아기 캐릭터)
- thin warm dark brown outline (두껍지 않은 갈색 아웃라인)
- pastel color palette: mint green, dusty pink, cream/peach skin tone, soft yellow
- rosy cheeks (볼터치), large round head, small dot eyes and tiny smile
- 1~2개의 소품/액세서리 포함
- white or transparent background
- warm, gentle, cozy mood — children's picture book style
- NO watermarks, NO text, NO background patterns

> ※ 소형 버튼/아이콘용 이미지는 AI 생성 대신 앱 내 색상 코딩 디자인을 사용한다.
>    (Gemini 등 AI는 "오브젝트만 그려줘" 지시를 무시하고 캐릭터 장면을 생성하는 한계가 있음)

---

## Gemini 프롬프트 — 대형 일러스트 전용

아래 프롬프트들은 온보딩, 빈 화면 등 **큰 영역에 쓰이는 이미지**에만 사용한다.

### 공통 베이스 (모든 프롬프트 앞에 붙일 것)
```
cute chibi baby character, sitting front-facing,
thin warm dark brown outline, flat pastel color fills,
mint green and dusty pink color palette, cream skin tone, rosy cheeks,
large round head with small dot eyes and tiny smile,
warm children's picture book style, white background, no text, no watermark,
```

---

### [온보딩] 아기 등록 화면 (`onboarding-baby.png` 교체용)
```
cute chibi baby character, sitting front-facing,
thin warm dark brown outline, flat pastel color fills,
mint green and dusty pink color palette, cream skin tone, rosy cheeks,
large round head with small dot eyes and tiny smile,
warm children's picture book style, white background, no text, no watermark,
baby wearing mint green overalls, sitting on a soft cream blanket,
small pink rabbit stuffed toy on the left, wooden rattle ring on the right
```

### [빈 화면] 오늘 기록 없음 (`empty-home.png` 교체용)
```
cute chibi baby character, sitting front-facing,
thin warm dark brown outline, flat pastel color fills,
mint green and dusty pink color palette, cream skin tone, rosy cheeks,
large round head with small dot eyes and tiny smile,
warm children's picture book style, white background, no text, no watermark,
baby holding a tiny pencil, open notebook on the floor beside, two small flowers nearby
```

### [빈 화면] 기록 탭 없음 (`empty-records.png` 교체용)
```
cute chibi baby character, sitting front-facing,
thin warm dark brown outline, flat pastel color fills,
mint green and dusty pink color palette, cream skin tone, rosy cheeks,
large round head with small dot eyes and tiny smile,
warm children's picture book style, white background, no text, no watermark,
baby sitting with a small clipboard or chart, looking curious, tiny magnifying glass prop
```

### [프로필] 기본 아기 프로필 이미지 (`baby-profile-default.png` 교체용)
```
cute chibi baby face portrait, front-facing close-up,
thin warm dark brown outline, flat pastel color fills,
cream skin tone, rosy cheeks, large round head, small dot eyes and tiny smile,
mint green simple bib or collar,
soft light cream background, circular crop friendly, no text, no watermark
```
