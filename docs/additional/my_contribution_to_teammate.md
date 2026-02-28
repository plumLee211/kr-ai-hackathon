# 팀원 아이디어(OOO's Adventure)에 내가 기여할 수 있는 것

> 최종 업데이트: 2026-02-28 — 현재 구현 상태 탐색 후 재작성

---

## 기여 방향 요약

팀원은 핵심 게임 루프(설문 -> GM 대화 -> 캐릭터 생성 -> 결과 화면)와 에셋 파이프라인(nano-banana-cli Step 1~4)을 이미 완성했다. 텍스트와 구조는 갖춰져 있으나, **보이고 들리는 레이어가 비어 있다.**

내가 채울 방향은 세 축이다:

1. **World Model 레이어**: 설문+SNS 분석으로 "세계 DNA"를 먼저 만들고, 이후 모든 생성(이미지/음악/GM 대사)이 이 공유 표현을 읽는다. 현재는 각 API가 독립적으로 동작해 세계가 파편적으로 느껴진다. 이 하나의 변경이 "AI가 나만의 세계를 만들었다"는 핵심 인상을 완성한다.

2. **감각 레이어 완성**: 이미지(현재 플레이스홀더), 음성(미구현), 음악(미구현)을 연결한다. 팀원이 만든 파이프라인과 UI가 있으나 실제로 렌더링되지 않는 상태를 해소한다.

3. **개인화 심화**: SNS 데이터를 게임 입력으로 사용해 "GM이 이미 나를 아는" 경험을 만든다. 설문 5개로는 얕은 개인화를 SNS 분석으로 보완한다.

---

## 현재 구현 상태

### story-builder (웹앱)

| 레이어 | 상태 | 비고 |
|--------|------|------|
| GM 채팅 대화 (설문 5개 수집) | [O] 완료 | Gemini Flash 멀티턴, JSON 구조화 응답 |
| 캐릭터 생성 (파티 3인 + 보스) | [O] 완료 | 텍스트 스탯/설명/imagePrompt 생성 |
| 캐릭터 카드 결과 화면 | [O] 완료 | 레이아웃/UI 완성, 이미지 영역은 플레이스홀더 |
| 배경 색상 단계 전환 | [O] 완료 | ScreenIndicator — 6단계 배경색 전환, BGM 주석만 존재 |
| 배경 크로스페이드 | [O] 완료 | DarkCityBackground → PixelCityBackground(세빛섬) 크로스페이드 |
| 타이틀 그라데이션 | [O] 완료 | AdventureTitle — step 진행에 따라 Gemini 4색 그라데이션 오버레이 유입 |
| 생성 결과 화면 | [O] 완료 | `/generate` 페이지 — 8-bit 아이템 획득 연출 (플래시+스태거), 파티 3+보스 1 |
| 로딩 연출 | [O] 완료 | GenerateContainer — GM 포즈 순환 + 유머 로딩 메시지 타이핑 |
| 이미지 실제 렌더링 | [X] 미연동 | imagePrompt 필드 생성되나 이미지 API 미호출 |
| 음성 (TTS) | [X] 미구현 | |
| 음악 / BGM | [X] 미구현 | |
| SNS 개인화 | [X] 미구현 | |
| GameMasterFace 비주얼 | [O] 완료 | GM 포즈 이미지 11종 (idle/greeting/asking/thinking/surprised/ok/celebrate/loading1~4) |
| 세계 공유 표현 (World DNA) | [X] 없음 | 각 API가 독립 동작 |

### nano-banana-cli (에셋 생성 CLI)

| 레이어 | 상태 | 비고 |
|--------|------|------|
| Step 1: 설문 -> 캐릭터 설정 JSON | [O] 완료 | |
| Step 2: 캐릭터 설정 -> 기본 일러스트 | [O] 완료 | |
| Step 3: 기본 일러 -> 스프라이트 시트 (16프레임) | [O] 완료 | |
| Step 4: 기본 일러 -> 공격/피격 표정 | [O] 완료 | |
| GM 포즈 이미지 7종 (WebP) | [O] 완료 | output/에 이미 존재 |
| 크로마키 배경 제거 | [O] 완료 | extract-background.ts |
| 영상(Video) 생성 | [X] 미구현 | script/video.ts — TODO 주석만, 모델 ID는 설정됨 |
| 음성 / 음악 | [X] 미구현 | |
| 파이프라인-웹앱 연동 | [X] 미연동 | CLI 수동 실행 전용, 웹앱과 분리됨 |

---

## 갭 -> 구현 아이템 목록

현재 구현 상태와 목표 데모 사이의 갭을 아이템으로 정리했다. 순서는 의존 관계와 임팩트 기준.

| # | 아이템 | 갭 근거 | 난이도 | 임팩트 |
|---|--------|---------|--------|--------|
| **S** | **Story Engine — 증분 스토리 빌드** | 스토리라인 자체가 없음 | 중간 | 매우 높음 |
| **A** | **World DNA — 세계 공유 표현 생성** | 각 API 독립 동작, 세계 파편화 | 낮음 | 매우 높음 |
| **B** | **이미지 파이프라인 웹앱 연동** | imagePrompt 있으나 이미지 미렌더링 | 낮음 | 높음 |
| **C** | **SNS 개인화 파이프라인** | 설문만으로 개인화 얕음 | 중간 | 높음 |
| **D** | **GM/보스 음성 (TTS)** | 음성 전혀 없음 | 낮음 | 높음 |
| **E** | **Lyria 3 BGM — 개인화 테마송** | BGM 주석만 존재 | 중간 | 높음 |
| **F** | **이미지 스타일 앵커링 + Critic 루프** | 이미지 일관성 보장 없음 | 낮음 | 중간 |
| **G** | **전투 동적 BGM (Lyria RealTime API)** | BGM 없음 | 높음 | 중간 |

S -> A 순서가 핵심 의존 관계다. Story Bible이 World DNA의 서사적 뼈대를 제공하고, World DNA가 나머지 B~G의 기반이 된다.

---

## 아이템 S: Story Engine — 증분 스토리 빌드

### 개념

현재 프로젝트는 설문 5개를 수집하고 캐릭터 스탯을 만든다. **서사가 없다.** "Story Builder"라는 이름인데 스토리를 생성하는 단계가 없는 상태.

Story Engine은 GM이 설문을 수집하는 동안 **백그라운드에서 점진적으로 스토리를 구성**한다. 설문이 완료되는 순간 스토리도 완성된다. 컬러 폭발 연출이 "세계와 스토리가 완성된 순간"의 시각화가 된다.

### 증분 빌드 흐름

```
[Turn 2: mbti 수집됨]   -> 주인공 직업/역할 초안
[Turn 3: + animal]      -> 파티원 1번 테마 확정
[Turn 4: + item]        -> 파티원 2~3번 테마 + 전투 스타일
[Turn 5: + fear]        -> 보스 확정 + Hero's Journey 구조 검증
                        -> Story Bible JSON 완성
```

### 스토리 법칙 강제

Story Engine 프롬프트에 아래 5법칙을 검증 조건으로 강제한다. `story_law_check`가 하나라도 실패하면 자동 재생성.

| 법칙 | 강제 내용 |
|------|-----------|
| 상처 = 보스의 힘 | `fear` 답변이 보스의 핵심 능력 근거가 되어야 함 |
| 파티 = 주인공의 결핍 | 파티원 3명이 주인공이 아직 갖지 못한 자질을 각각 체현 |
| 클라이맥스 = 공포와의 직면 | 보스전 정점에서 반드시 `fear`가 트리거됨 |
| 내면 호 = MBTI 그림자 | 주인공 내적 성장이 MBTI 취약 측면을 극복하는 방향 |
| 해결 = 상처의 치유 | 승리 연출이 단순 격파가 아니라 `fear` 극복으로 귀결 |

기반 구조는 Hero's Journey (3막):

```
1막: 평범한 세계 -> 부름     (SNS/설문 데이터로 개인화)
2막: 시련 -> 클라이맥스       (공포와 직면)
3막: 변화 -> 귀환             (상처 치유 + 파티와의 유대)
```

### Story Bible JSON 출력

```json
{
  "world": "황혼의 메아리 영역",
  "act1": {
    "ordinary_world": "...",
    "call": "고립자가 세계의 유대를 끊기 시작했다",
    "wound": "고독"
  },
  "act2": {
    "trials": ["...", "..."],
    "ordeal": "고립자가 파티원들을 하나씩 격리시킨다",
    "darkest_moment": "혼자 남겨진 주인공"
  },
  "act3": {
    "climax": "공포를 받아들이는 순간 파티원들이 돌아온다",
    "resolution": "유대를 통한 고독 극복",
    "transformation": "MBTI 그림자 극복"
  },
  "characters": {
    "hero_flaw": "...",
    "party": [
      { "role": "mentor", "theme": "animal 기반", "fills": "주인공의 결핍 A" },
      { "role": "trickster", "theme": "mbti 보완", "fills": "주인공의 결핍 B" },
      { "role": "guardian", "theme": "item 기반", "fills": "주인공의 결핍 C" }
    ],
    "boss_archetype": "shadow",
    "boss_power_source": "고독"
  },
  "story_law_check": {
    "wound_equals_boss": true,
    "party_fills_lack": true,
    "climax_triggers_fear": true,
    "resolution_heals_wound": true
  }
}
```

### 아이템 A와의 관계

Story Bible이 World DNA의 서사적 뼈대를 제공한다.

```
Story Bible (서사 구조)
  + SNS 분석 (감각적 분위기)
  -> World DNA (세계 공유 표현)
  -> 이미지 / 음악 / GM 대사 모두 World DNA 기반
```

### 구현

| 작업 | 시간 | 파일 |
|------|------|------|
| `/api/story` 라우트 신규 작성 | 당일 1.5h | `story-builder/src/app/api/story/route.ts` |
| 증분 빌드: `collectedFields` 변화 감지 -> 백그라운드 호출 | 당일 1h | `IntroContainer.tsx` — 기존 `allCollected` 로직 옆에 추가 |
| Story Bible -> World DNA 입력 연결 | 당일 30m | 아이템 A 작업 시 통합 |

**당일 투자: 3h**

---

## 아이템 A: World DNA — 세계 공유 표현

### 개념

World Model의 핵심은 **"일관된 잠재 세계 표현"** 이다. 현재 프로젝트는 GM 채팅, 캐릭터 생성, 이미지, BGM이 각자 독립적으로 동작한다. World DNA는 설문+SNS 분석에서 세계 표현 JSON 하나를 먼저 추출하고, 이후 모든 생성 단계가 이걸 공유한다.

```
설문 + SNS 분석
  -> /api/world (신규)
  -> World DNA JSON 생성

World DNA
  -> buildChatSystemPrompt() 에 주입 (GM 말투, 세계관)
  -> buildGenerateSystemPrompt() 에 주입 (캐릭터 테마)
  -> 이미지 프롬프트에 팔레트/분위기 주입
  -> Lyria BGM 프롬프트에 무드 주입
```

World DNA 스키마 예시:

```json
{
  "world_name": "황혼의 메아리 영역",
  "palette": "warm amber, twilight purple",
  "atmosphere": "melancholic but hopeful",
  "primary_fear": "고독",
  "boss_archetype": "고립자",
  "musical_mood": "gentle strings with building urgency",
  "power_source": "타인과의 유대",
  "consequence_chain": {
    "fear": "dungeon filled with isolation imagery",
    "boss_taunt": "넌 결국 혼자잖아...",
    "victory_scene": "파티원들이 모여드는 장면"
  }
}
```

### Consequence Propagation

공포 답변 하나가 세계 전체에 전파된다:

```
공포: "고독"
  -> 배경 이미지 프롬프트: "abandoned halls, empty chairs, echoing silence"
  -> 보스 대사: "넌 결국 혼자잖아..."
  -> 파티원 중 1명: 고독을 이겨낸 캐릭터 (대응 구조)
  -> 승리 연출: 파티원들이 모여드는 장면
```

단순 "공포 -> 보스 테마"가 아니라 공포가 세계의 모든 레이어에 일관되게 흐른다.

### 피치 프레이밍

"7개의 AI가 같은 세계 표현을 공유하며 협연한다" — `project_gap_analysis.md` P3 멀티에이전트 오케스트레이션 약점을 해소한다.

### 구현

| 작업 | 시간 | 파일 |
|------|------|------|
| `/api/world` 라우트 신규 작성 | 당일 1h | `story-builder/src/app/api/world/route.ts` |
| World DNA -> 기존 프롬프트 함수 주입 | 당일 1h | `constants/prompt/chat.ts`, `constants/prompt/generate.ts` |

**당일 투자: 2h**

---

## 아이템 B: 이미지 파이프라인 웹앱 연동

### 문제

`/api/generate`가 `imagePrompt` 필드를 반환하지만 이미지 API를 호출하지 않는다. 결과 화면 캐릭터 카드가 모두 아이콘 플레이스홀더 상태.

### 구현

nano-banana-cli Step 2의 Gemini 이미지 모델 호출 로직을 웹앱 API로 포팅한다.

```
imagePrompt (from /api/generate)
  -> /api/image (신규)
  -> gemini-3.1-flash-image-preview 호출
  -> base64 이미지 반환
  -> 캐릭터 카드에 실제 이미지 표시
```

World DNA의 팔레트/분위기를 이미지 프롬프트에 주입하면 스타일 앵커링(아이템 F)과 자동 통합.

| 작업 | 시간 | 파일 |
|------|------|------|
| `/api/image` 라우트 신규 작성 | 당일 1h | `story-builder/src/app/api/image/route.ts` |
| 캐릭터 카드 이미지 컴포넌트 연결 | 당일 30m | `ResultCards.tsx` 결과 화면 영역 |

**당일 투자: 1.5h**

---

## 아이템 C: SNS 개인화 파이프라인

### 문제

설문 5개로는 "AI가 나를 안다"는 느낌이 약하다. GM이 빈 상태에서 정보를 물어보는 구조.

### 구현

Instagram + X 데이터를 Gemini Vision으로 분석해 World DNA 생성 입력으로 사용한다.

```
Instagram 사진 20장 + X 트윗 50개
  -> Gemini Vision 분석
  -> { 색조, 분위기, 관심사, 말투 } 추출
  -> /api/world 에 전달 -> World DNA 생성

GM 첫 대사:
  [기존] "좋아하는 동물이 뭐야?"
  [변경] "네 사진을 보니 고양이를 좋아하는구나... 이 녀석은 어때?"
```

설문은 SNS 분석의 확인/보정 역할로 유지.

| 작업 | 시간 | 비고 |
|------|------|------|
| Instagram Graph API + X API v2 세팅 | 사전 준비 1.5h | 본인 계정, 심사 불필요. 데이터 JSON 캐싱으로 데모 안정성 확보 |
| Gemini Vision 분석 프롬프트 | 당일 1h | 사진 -> 색조/분위기/관심사 추출 |
| `/api/world` 입력으로 연결 | 당일 30m | 아이템 A 완성 후 |

**당일 투자: 1.5h**

---

## 아이템 D: GM/보스 음성 (TTS)

### 문제

GM은 텍스트로만 대화한다. GM 포즈 이미지 7종이 이미 완성돼 있어 음성이 추가되면 캐릭터 존재감이 완성된다.

### 연결 지점

`IntroContainer.tsx`의 `gmMessage` state 업데이트 시점에 TTS 트리거 추가. `DialogBox.tsx` 자막 표시는 이미 구현돼 있음.

### TTS 옵션

| 옵션 | 장점 |
|------|------|
| **ElevenLabs** | 최고 품질, 감정 파라미터, 무료 10분/월 (데모 충분) |
| **Google Cloud TTS** | All Google 스택, 심사 어필 |
| **Supertone** | 한국어 특화 |

추천: ElevenLabs (품질 압도적)

| 작업 | 시간 | 비고 |
|------|------|------|
| GM/보스 음성 프로필 생성 | 사전 준비 1h | Voice Design |
| TTS API 연동 + BGM 볼륨 믹싱 | 당일 1.5h | GainNode 크로스페이드 |

**당일 투자: 1.5h**

---

## 아이템 E: Lyria 3 BGM — 개인화 테마송

### 문제

BGM 없음. `ScreenIndicator.tsx`에 "BGM 시작!" 주석만 존재.

### 구현

World DNA의 `musical_mood`를 Lyria 3 프롬프트로 변환해 설문 완료 직후 30초 개인화 테마송을 생성한다.

```
World DNA.musical_mood: "gentle strings with building urgency"
  -> Lyria 프롬프트: "Warm orchestral JRPG hero theme,
     gentle strings with driving percussion, 30 seconds, hopeful and brave"
  -> Gemini 컬러 폭발과 동시에 재생 (시각+청각 동시 폭발)
```

### 연결 지점

`ScreenIndicator.tsx` step 변화 훅. Step별 배경색 전환 타이밍 그대로 BGM 단계 전환에 재활용 가능.

| 작업 | 시간 | 비고 |
|------|------|------|
| 플레이어 테마송 생성 파이프라인 | 당일 1h | World DNA -> Lyria 프롬프트 변환 |

**당일 투자: 1h**

---

## 아이템 F: 이미지 스타일 앵커링 + Critic 루프

### 문제

이미지 연동(아이템 B) 시 파티원 4장의 스타일 일관성 보장 없음.

### 전략 A: 스타일 앵커링 (실시간 — 추가 비용 없음)

첫 번째 생성 이미지 설명을 이후 프롬프트에 레퍼런스로 주입.

```typescript
const firstDesc = "JRPG fantasy style, warm amber palette, soft edges"
const prompt = `Style reference: ${firstDesc}. Now generate: ${characterDesc}`
```

아이템 B 작업 시 30분 추가로 함께 적용 가능.

### 전략 B: Critic 루프 (백그라운드 생성용)

전투 중 백그라운드에서 미리 생성되는 에셋(배경, 다음 보스 아트)에 적용.

```
이미지 생성 -> Gemini 검수 (스타일 일치? 세계관 일관?) -> 통과/재생성
```

| 작업 | 시간 | 비고 |
|------|------|------|
| 스타일 앵커링 | +30m | 아이템 B에 통합 |
| Critic 루프 | 당일 1h | 백그라운드 생성 전용 |

**당일 투자: 1.5h**

---

## 아이템 G: 전투 동적 BGM (Lyria RealTime API)

### 구현

전투 이벤트에 따라 BGM이 seamless 전환. Lyria RealTime API의 2초 청크 스트리밍 활용.

```
보스 등장 -> 긴장감 있는 단조
전투 중   -> 빠른 템포
승리      -> 팡파르
```

시간 여유가 있을 때 아이템 E 이후 추가.

**당일 투자: 1.5h**

---

## 시간 배분

### 사전 준비 (전날)

| 작업 | 시간 |
|------|------|
| Instagram/X API 세팅 + 데이터 JSON 캐싱 | 1.5h |
| ElevenLabs GM/보스 음성 프로필 생성 | 1h |
| **합계** | **2.5h** |

### 해커톤 당일

| 순서 | 아이템 | 작업 | 시간 |
|------|--------|------|------|
| 1 | **S** | Story Engine API + 증분 빌드 + 스토리 법칙 검증 | 3h |
| 2 | **A** | World DNA API + Story Bible 연결 + 기존 프롬프트 주입 | 2h |
| 3 | **B** | 이미지 파이프라인 웹앱 연동 (+F 앵커링 통합) | 2h |
| 4 | **C** | SNS 분석 -> World DNA 연결 | 1.5h |
| 5 | **D** | GM/보스 TTS + BGM 믹싱 | 1.5h |
| 6 | **E** | Lyria 개인화 테마송 | 1h |
| 7 | **F** | Critic 루프 | 1h |
| 8 | **G** | 전투 동적 BGM (여유 시) | 1.5h |
| 9 | — | 통합 테스트 | 0.5h |
| | | **합계 (G 제외)** | **12.5h** |

### 역할 분담

```
[팀원 이미 구현]               [내 담당]
설문 UI + GM 채팅 대화           S: Story Engine (증분 스토리 빌드)
캐릭터 생성 (텍스트)             A: World DNA (세계 공유 표현)
nano-banana-cli 에셋 파이프라인  B: 이미지 파이프라인 웹앱 연동
ScreenIndicator 배경 전환        C: SNS 개인화 파이프라인
                                 D: GM/보스 TTS 음성
                                 E+G: Lyria BGM (테마송 + 동적 전투)
                                 F: 이미지 Critic 루프
```

---

## 데모 변화 비교

| 시점 | 현재 | 기여 후 |
|------|------|---------|
| 0:00 | GM 텍스트 등장, 무음 | **GM이 목소리로 말한다** + SNS 로그인 |
| 0:20 | 설문 5개 대화 (빈 상태에서 시작) | **"네 사진을 보니..."** GM이 이미 나를 아는 듯 |
| 0:50 | Gemini 컬러 폭발, 무음 | 컬러 폭발 + **나만의 테마송 재생** |
| 1:10 | 캐릭터 카드 (아이콘 플레이스홀더) | **실제 이미지** + World DNA 기반 일관된 스타일 |
| 1:30 | 결과 화면 끝 | **보스 음성 등장** + **동적 전투 BGM** |
| 2:30 | — | 보스 처치 + **승리 팡파르 자동 전환** |

**핵심 변화:**
텍스트 설문->결과 화면 -> **"7개 AI가 같은 세계 DNA를 공유하며 만들어낸" 풀 멀티모달 개인화 경험.**
