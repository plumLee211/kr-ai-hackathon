# Story Builder

OOO's Adventure — Gemini Game Master 설문 + 파티/보스 생성

## 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── chat/           # 설문 대화 API (매 턴 Gemini 호출)
│   │   └── generate/       # 파티 + 보스 생성 API (설문 완료 후 1회)
│   ├── page.tsx            # 메인 페이지
│   └── layout.tsx
│
├── components/             # UI 컴포넌트
│   └── intro/
│       ├── IntroContainer  # 대화 플로우 오케스트레이터
│       ├── DialogBox       # 터미널 스타일 입력 UI
│       ├── GameMasterFace  # GM 얼굴 + 색상 전환
│       └── ScreenIndicator # 배경 색상 진행
│
├── constants/              # 상수 + 프롬프트
│   ├── survey.ts           # 설문 필드 정의 (Single Source of Truth)
│   └── prompt/             # ★ Gemini 프롬프트 관리
│       ├── chat.ts         # 설문 대화 시스템 프롬프트
│       └── generate.ts     # 파티/보스 생성 시스템 프롬프트
│
└── utils/                  # 유틸리티 함수
```

## 프롬프트 관리

이 프로젝트의 핵심은 **프롬프트**다. 게임의 품질이 프롬프트에 의해 결정된다.

- **`constants/prompt/chat.ts`** — Game Master의 성격, 말투, 수집 규칙, JSON 응답 스키마를 정의한다. 설문 대화의 자연스러움과 필드 추출 정확도가 여기서 결정된다.
- **`constants/prompt/generate.ts`** — 수집된 설문 데이터를 기반으로 파티원/보스를 생성하는 프롬프트. 캐릭터의 매력도와 imagePrompt 품질이 여기서 결정된다.
- **`constants/survey.ts`** — 설문 필드 목록(`SURVEY_FIELDS`)을 중앙 관리한다. 필드를 추가/제거하면 chat, generate, UI가 모두 자동으로 반영된다.

## 설정

```bash
cp .env.example .env
# .env에 GOOGLE_AI_API_KEY 입력
pnpm dev
```
