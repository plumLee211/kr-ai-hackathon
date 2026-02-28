import type { Answers } from "@/constants/survey";
import type { WorldDNA } from "@/types/world";

/**
 * 모든 캐릭터 이미지에 공통 적용되는 스타일 앵커.
 * Gemini가 생성하지 않고 코드에서 고정 — 일관된 그림체 보장.
 */
export const CHARACTER_STYLE_ANCHOR = `Style requirements:
- Anime illustration style, inspired by Persona series and modern JRPG character art.
- Vibrant, saturated colors with bold black outlines (2-3px).
- Upper body portrait, front-facing, neutral expression.
- Clean, detailed anime cel-shading with smooth gradients.
- Simple solid-color background for easy extraction.
- High resolution, sharp lines, no artifacts.

Framing (MUST maintain for all characters):
- Character centered horizontally with equal margins.
- Head top at ~5% from image top edge.
- Waist/torso bottom at ~95% from image bottom edge.
- Character occupies ~90% of image width.`;

/**
 * 공통 스타일 앵커 + 캐릭터별 외형 + WorldDNA를 합성하여
 * 최종 이미지 생성 프롬프트를 반환.
 */
export function buildCharacterImagePrompt(
  appearance: string,
  worldDna?: WorldDNA,
): string {
  const worldSection = worldDna
    ? `\nWorld theme:\n- Color palette: ${worldDna.palette}\n- Atmosphere: ${worldDna.atmosphere}`
    : "";

  return `${CHARACTER_STYLE_ANCHOR}${worldSection}\n\nCharacter design:\n${appearance}`;
}

export function buildGenerateSystemPrompt(data: Answers, worldDna?: WorldDNA): string {
  return `너는 JRPG 게임의 세계관 제작자(Game Master)야. 유저가 입력한 데이터를 바탕으로 독특하고 매력적인 파티원 3명과 보스 1명을 생성해 줘.

[유저 데이터]
- 주인공 이름: ${data.name}
- 파티원 A 테마 (MBTI): ${data.mbti}
- 파티원 B 테마 (좋아하는 동물): ${data.animal}
- 파티원 C 테마 (멸망 아이템): ${data.item}
- 보스 테마 (가장 무서워하는 것): ${data.fear}

[응답 규칙]
- 반드시 아래 JSON 스키마를 100% 준수하여 응답해.
- 파티의 첫 번째 캐릭터는 반드시 주인공(${data.name})이어야 해.
- 각 캐릭터의 'appearance'는 영문으로 작성해. 캐릭터의 외형만 묘사해 (체형, 헤어스타일, 의상, 표정, 장식, 소품 등). 아트 스타일이나 배경, 프레이밍 지시는 포함하지 마.

[출력 스키마 예시]
{
  "party": [
    {
      "id": "hero",
      "name": "김철수",
      "role": "용사",
      "hp": 100,
      "atk": 25,
      "description": "운명을 개척하는 자.",
      "appearance": "young Korean man with short black hair, wearing a lightweight silver breastplate over a dark blue tunic, determined brown eyes, a simple iron sword strapped to his back"
    }
  ],
  "boss": {
    "name": "거대 바퀴벌레 마왕",
    "role": "마왕",
    "hp": 600,
    "atk": 40,
    "description": "크크크... 나를 무서워한다고?",
    "appearance": "massive cockroach demon with chitinous dark brown armor plating, six clawed arms, glowing red compound eyes, tattered dark cape, towering menacing physique"
  }
}${worldDna ? `

[세계 DNA - 모든 캐릭터와 세계관은 아래 World DNA를 반드시 반영해야 해]
- 세계 이름: ${worldDna.world_name}
- 시각 팔레트: ${worldDna.palette}
- 분위기: ${worldDna.atmosphere}
- 핵심 공포 테마: ${worldDna.primary_fear}
- 보스 원형: ${worldDna.boss_archetype}
- 보스 대사: "${worldDna.consequence_chain.boss_taunt}"
- 승리 장면: ${worldDna.consequence_chain.victory_scene}
- appearance에 World DNA의 분위기와 테마를 반영해. (팔레트, 분위기 키워드는 포함하지 마 — 자동으로 합성됨)` : ""}`;
}
