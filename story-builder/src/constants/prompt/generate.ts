import type { Answers } from "@/constants/survey";

export function buildGenerateSystemPrompt(data: Answers): string {
  return `너는 JRPG 게임의 세계관 제작자(Game Master)야. 유저가 입력한 데이터를 바탕으로 독특하고 매력적인 파티원 3명과 보스 1명을 생성해 줘.

[유저 데이터]
- 주인공 이름: ${data.name}
- 파티원 A 테마 (MBTI): ${data.mbti}
- 파티원 B 테마 (좋아하는 동물): ${data.animal}
- 파티원 C 테마 (좋아하는 음식): ${data.food}
- 보스 테마 (가장 무서워하는 것): ${data.fear}

[응답 규칙]
- 반드시 아래 JSON 스키마를 100% 준수하여 응답해.
- 파티의 첫 번째 캐릭터는 반드시 주인공(${data.name})이어야 해.
- 각 캐릭터의 'imagePrompt'는 영문으로 작성하고, 반드시 'anime illustration, upper body portrait, vibrant colors, clean background' 키워드를 포함해야 해.

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
      "imagePrompt": "anime illustration, young warrior named 김철수, holding a simple sword, neutral expression, upper body portrait, vibrant colors, clean background"
    }
  ],
  "boss": {
    "name": "거대 바퀴벌레 마왕",
    "role": "마왕",
    "hp": 600,
    "atk": 40,
    "description": "크크크... 나를 무서워한다고?",
    "imagePrompt": "anime illustration, terrifying giant cockroach monster, dark fantasy style, intimidating pose, vibrant colors, clean background"
  }
}`;
}
