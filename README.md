# Story Builder — Gemini 서울 해커톤 2026

설문 답변을 기반으로 RPG 캐릭터와 스토리를 자동 생성하는 AI 게임 인트로 서비스.

## 프로젝트 구조

```
kr-ai-hackathon/
├── story-builder/        # Next.js 웹 앱 — 게임 인트로 UI
└── nano-banana-cli/      # CLI 도구 — Gemini AI 캐릭터 에셋 생성 파이프라인
```

## 서비스 흐름

```
[story-builder]                    [nano-banana-cli]
사용자 설문 입력                     설문 답변 → 캐릭터 에셋 생성
  1. 이름                             Step 1: 설문 → 캐릭터 설정 JSON
  2. MBTI                             Step 2: 설정 → 기본 일러스트
  3. 좋아하는 동물/음식                Step 3: 기본 일러 → 스프라이트 시트
  4. 세상에서 가장 무서운 것           Step 4: 기본 일러 → 공격/피격 표정
```

## 기술 스택

| | 기술 |
|---|---|
| 프론트엔드 | Next.js 16, React 19, Tailwind CSS 4 |
| AI | Gemini 3 Flash (텍스트), Gemini 3.1 Flash Image (이미지) |
| 패키지 매니저 | pnpm (워크스페이스) |
| 배포 | GCP Cloud Run |

---

## 개발 환경 설정

### 사전 요구사항

- Node.js 20+
- pnpm

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm@latest
```

### 설치

```bash
pnpm install
```

### 환경 변수

각 패키지에 `.env` 파일 생성:

```bash
# story-builder/.env
GOOGLE_AI_API_KEY=your_api_key_here

# nano-banana-cli/.env
GOOGLE_AI_API_KEY=your_api_key_here
```

---

## 실행

### story-builder (웹 앱)

```bash
# 개발 서버
npm run dev
# → http://localhost:3000
```

### nano-banana-cli (캐릭터 에셋 생성)

```bash
# 이미지 생성
npm run gen

# 영상 생성
npm run video

# 배경 추출
npm run extract

# 전체 파이프라인 테스트
npm run pipeline-test -- "강아지" animal
# 인자: <설문 답변> <타입: animal|mbti|food|fear>
```

생성된 파일은 `nano-banana-cli/output/` 에 저장됩니다.

---

## 캐릭터 생성 파이프라인

`nano-banana-cli`는 4단계 파이프라인으로 캐릭터 에셋을 생성합니다.

| 단계 | 입력 | 출력 | 모델 |
|------|------|------|------|
| Step 1 | 설문 답변 | 캐릭터 설정 JSON (이름, 직업, 종족, 외형, 색상 팔레트) | gemini-3-flash-preview |
| Step 2 | 캐릭터 설정 | 기본 일러스트 2K (1:1) | gemini-3.1-flash-image-preview |
| Step 3 | 기본 일러스트 | 스프라이트 시트 1K (1:1) | gemini-3.1-flash-image-preview |
| Step 4 | 기본 일러스트 | 공격/피격 표정 2장 | gemini-3.1-flash-image-preview |

---

## 배포

`deploy/cloud-run` 브랜치에 push하면 GitHub Actions가 자동으로 GCP Cloud Run에 배포합니다.
