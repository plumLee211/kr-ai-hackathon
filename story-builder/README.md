# Story Builder

> 이 문서는 드라이하게 작성한다. 사실만 적고 감상은 빼라.

Gemini 기반 설문 대화 → 파티/보스 생성

## 설정

```bash
cp .env.example .env
# .env에 GOOGLE_AI_API_KEY 입력
pnpm dev
```

## 폴더 구조

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # 설문 대화 API
│   │   └── generate/route.ts    # 파티+보스 생성 API
│   ├── page.tsx
│   └── layout.tsx
├── components/intro/
│   ├── IntroContainer.tsx       # 대화 플로우 제어
│   ├── DialogBox.tsx            # 입력 UI
│   ├── GameMasterFace.tsx       # GM 아이콘
│   └── ScreenIndicator.tsx      # 배경 전환
├── constants/
│   ├── survey.ts                # 설문 필드 정의
│   └── prompt/
│       ├── chat.ts              # 대화 프롬프트
│       └── generate.ts          # 생성 프롬프트
```

## 프롬프트 관리

- `constants/prompt/chat.ts` — GM 성격, 수집 규칙, JSON 응답 스키마
- `constants/prompt/generate.ts` — 설문 데이터 → 파티원/보스 생성 스키마
- `constants/survey.ts` — 필드 목록 중앙 관리. 여기 수정하면 chat, generate, UI 전부 반영

## 화면 흐름

단일 페이지(`/`). `step` 0~5로 전환.

```
페이지 로드 → fetchGreeting()
       │
       ▼
  Step 0  검정, GM 회색 — 인사
       │  입력 → POST /api/chat
       ▼
  Step 1  연보라, GM 파랑 — name
       │  입력 → POST /api/chat
       ▼
  Step 2  진보라, GM 남색 — mbti
       │  입력 → POST /api/chat
       ▼
  Step 3  보라 그라데이션, GM 보라 — animal
       │  입력 → POST /api/chat
       ▼
  Step 4  마젠타, GM 핑크 — item
       │  입력 → POST /api/chat
       ▼
  Step 5  4색 그라데이션, GM 노랑 — fear
       │  PRESS START → POST /api/generate
       ▼
  생성 완료 — 콘솔 출력 (파티 4 + 보스 1)
```

## 필드 → 캐릭터 매핑

| 필드 | 질문 | 결과 |
|------|------|------|
| `name` | 이름 | 파티원 1 (주인공) |
| `mbti` | MBTI | 파티원 2 |
| `animal` | 좋아하는 동물 | 파티원 3 |
| `item` | 멸망 시 챙길 물건 | 파티원 4 |
| `fear` | 가장 무서운 것 | 보스 |
