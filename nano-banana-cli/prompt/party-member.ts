// ============================================================
// 파티원 캐릭터 에셋 파이프라인 프롬프트 모음
// Step 1: 설문 → 캐릭터 설정 JSON (Gemini Flash 텍스트)
// Step 2: 캐릭터 설정 → 기본 일러스트 (Nano Banana 이미지)
// Step 3: 기본 일러 참조 → 스프라이트 시트 (Nano Banana 이미지)
// Step 4: 기본 일러 참조 → 공격/피격 표정 (Nano Banana 이미지)
// ============================================================

// ============================================================
// Step 1 — 설문 입력 → 캐릭터 설정 JSON
// ============================================================

/**
 * Step 1 시스템 프롬프트.
 * Gemini Flash 텍스트 모델에서 JSON 출력을 강제하기 위한 시스템 지시.
 */
export const CHARACTER_TRANSFORM_SYSTEM = `너는 판타지 RPG 게임 "OOO's Adventure"의 캐릭터 디자이너야.
플레이어의 설문 응답을 받아 게임 세계관에 어울리는 파티원 캐릭터 설정으로 변환해.

반드시 아래 JSON 스키마로만 응답해. 추가 텍스트 없이 JSON만 출력해.

{
  "name": "캐릭터 이름 (한글, 2~4글자, 설문 답변에서 영감)",
  "class": "직업/클래스 (전사, 마법사, 궁수, 힐러, 도적, 소환사 등)",
  "race": "종족 (인간, 수인, 엘프, 드워프, 정령, 요정 등)",
  "appearance": "외형 묘사 (영어, 3~4문장. 체형, 헤어, 의상, 특징적 장식 등. 이미지 생성 프롬프트에 직접 사용됨)",
  "colorPalette": ["주색상", "보조색상", "강조색상"],
  "personality": "성격 한줄 요약 (한글)"
}

규칙:
- appearance는 반드시 영어로 작성. 이미지 생성 AI에 바로 넣을 수 있는 디테일한 외형 묘사.
- colorPalette는 hex 코드 3개. 설문 답변의 이미지에서 자연스럽게 연상되는 색상.
- 설문 답변의 본질을 캐릭터 디자인에 창의적으로 반영. 단순 의인화가 아닌 판타지 세계관 해석.
- name은 한글로, 설문 답변에서 영감을 받되 게임 캐릭터답게.`;

/**
 * Step 1 사용자 프롬프트 생성.
 * @param surveyType 설문 유형: "animal" | "mbti" | "food" | "fear"
 * @param answer 설문 답변 (예: "강아지", "INFP", "불닭볶음면", "거미")
 */
export const characterTransformPrompt = (
  surveyType: "animal" | "mbti" | "food" | "fear",
  answer: string,
): string => {
  const context: Record<string, string> = {
    animal: `플레이어가 좋아하는 동물: "${answer}"
이 동물의 특성(성격, 외형, 능력)을 판타지 RPG 파티원 캐릭터로 변환해줘.
역할: 파티원 B (동물 기반)`,
    mbti: `플레이어의 MBTI: "${answer}"
이 성격 유형의 특성을 판타지 RPG 파티원 캐릭터로 변환해줘.
역할: 파티원 A (MBTI 기반)`,
    food: `플레이어가 좋아하는 음식: "${answer}"
이 음식의 특성(색감, 재료, 느낌)을 판타지 RPG 파티원 캐릭터로 변환해줘.
역할: 파티원 C (음식 기반)`,
    fear: `플레이어가 무서워하는 것: "${answer}"
이 공포의 대상을 판타지 RPG 보스 캐릭터로 변환해줘.
역할: 보스 (공포 기반). 위협적이고 강력한 존재로 디자인.`,
  };

  return context[surveyType];
};

// ============================================================
// Step 2 — 캐릭터 설정 → 기본 일러스트 1장
// ============================================================

/**
 * Step 2 기본 일러스트 프롬프트.
 * 텍스트만으로 생성 (참조 이미지 없음). 페르소나 스타일.
 * @param name 캐릭터 이름
 * @param appearance 영어 외형 묘사 (Step 1의 appearance 필드)
 * @param palette hex 색상 배열
 */
export const baseIllustrationPrompt = (
  name: string,
  appearance: string,
  palette: string[],
): string => `Generate a single character illustration of "${name}".

**IMPORTANT: Exactly ONE character only. No character sheets, no multiple angles, no duplicates.**

Character design:
${appearance}

Color palette: ${palette.join(", ")}

Style requirements:
- Anime illustration style, inspired by Persona series character art.
- Vibrant, saturated colors with bold black outlines (3-4px).
- Full body portrait, front-facing, neutral standing pose.
- Clean, detailed anime cel-shading.
- Bright neon green solid background (#00FF00) for chroma-key extraction.
- High resolution, sharp lines.

Framing (MUST maintain):
- Character's head top at ~10% from image top edge.
- Character's feet at ~10% from image bottom edge.
- Character centered horizontally with equal margins.
- Character occupies ~80% of image height.`;

// ============================================================
// Step 3 — 기본 일러 참조 → 스프라이트 시트 (4방향 x 4프레임)
// ============================================================

/**
 * Step 3 스프라이트 시트 프롬프트.
 * 반드시 Step 2 기본 일러스트를 참조 이미지로 함께 전달해야 함.
 * @param name 캐릭터 이름
 */
export const spriteSheetPrompt = (name: string): string => {

  return `다음 이미지는 "${name}" 캐릭터입니다.
          이 캐릭터의 상하좌우 걷는 도트 스프라이트 이미지를 생성해줘.

          요구사항:
          - 모던 픽셀 아트 스타일 (스타듀밸리, 언더테일 레퍼런스). 둥근 머리, 2~3등신 비율.
          - 4방향 걷기 애니메이션, 방향당 4프레임 = 총 16프레임.
          - **단일 스프라이트 시트 이미지**로 출력. 4행 4열 그리드.
          - 행 순서 (반드시 지켜야 함):
            - 첫번째 행: 상(뒤) 걷기 4프레임
            - 두번째 행: 하(앞) 걷기 4프레임
            - 세번째 행: 좌 걷기 4프레임
            - 네번째 행: 우 걷기 4프레임
          - 참조 이미지의 캐릭터 디자인·색상을 충실히 반영.
          - 또렷한 외곽선, 제한된 색상 팔레트 (4~6색).
          - 형광 초록 단색 배경 (#00FF00) 보장. 결과물을 바로 crop해서 사용할 수 있도록.
          - 각 프레임 크기가 균일하게.`;
};

// ============================================================
// Step 4 — 기본 일러 참조 → 공격/피격 표정
// ============================================================

/**
 * Step 4 표정 프롬프트.
 * 반드시 Step 2 기본 일러스트를 참조 이미지로 함께 전달해야 함.
 * @param name 캐릭터 이름
 * @param expression "attack" | "hurt"
 */
export const expressionPrompt = (
  name: string,
  expression: "attack" | "hurt",
): string => {
  const expressionGuide = {
    attack: `Attacking expression and action pose:
- Confident, fierce facial expression with determined eyes.
- Dynamic action pose — weapon drawn or casting a spell, leaning forward aggressively.
- Energy effects or motion lines to convey power.`,
    hurt: `Hurt/damaged expression and pose:
- Pained, surprised facial expression — eyes squeezed, teeth gritted.
- Defensive recoil pose — leaning back, one arm raised to shield.
- Minor damage effects (scratches, torn clothing edge).`,
  };

  return `다음 이미지는 "${name}" 캐릭터의 기본 일러스트입니다.

**동일한 캐릭터**의 ${expression === "attack" ? "공격" : "피격"} 표정/포즈 일러스트를 생성해줘.

**IMPORTANT: Exactly ONE character only. Must be the SAME character as the reference image.**

${expressionGuide[expression]}

Style requirements (MUST match reference):
- Same anime illustration style, same character design, same color palette.
- Vibrant, saturated colors with bold black outlines (3-4px).
- Full body portrait, same framing as reference.
- Clean anime cel-shading.
- Bright neon green solid background (#00FF00) for chroma-key.
- High resolution, sharp lines.

Framing (MUST maintain identical to reference):
- Character's head top at ~10% from image top edge.
- Character's feet at ~10% from image bottom edge.
- Character centered horizontally.
- Character occupies ~80% of image height.`;
};
