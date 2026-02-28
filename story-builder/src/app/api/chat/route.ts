import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// ── Types ──

interface CollectedFields {
  name: string | null;
  mbti: string | null;
  animalFood: string | null;
  fear: string | null;
}

interface ChatRequest {
  messages: Array<{ role: "user" | "model"; content: string }>;
  collectedFields: CollectedFields;
}

interface ChatResponse {
  gmMessage: string;
  placeholder: string;
  collectedFields: CollectedFields;
  newlyCollected: string[];
  allCollected: boolean;
}

// ── Gemini Client ──

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
const MODEL = "gemini-3-flash-preview";

// ── System Prompt Builder ──

function buildSystemPrompt(fields: CollectedFields, turnCount: number): string {
  const collected = Object.entries(fields)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: "${v}"`)
    .join(", ");

  const missing = Object.entries(fields)
    .filter(([, v]) => v === null)
    .map(([k]) => k);

  const urgencyHint =
    turnCount > 16
      ? "\n\n[긴급] 대화가 길어지고 있어. 남은 정보를 빨리 수집하되 자연스럽게 해줘."
      : "";

  return `너는 "OOO's Adventure" RPG 게임의 Game Master야.
플레이어와 자연스럽고 재밌는 대화를 나누면서, 아래 4가지 정보를 수집해야 해.

## 수집할 정보
1. name: 플레이어의 이름 (또는 닉네임)
2. mbti: 플레이어의 MBTI (16가지 중 하나)
3. animalFood: 플레이어가 좋아하는 동물과 음식 (예: "강아지 떡볶이")
4. fear: 플레이어가 세상에서 제일 무서워하는 것

## 현재 상태
- 이미 수집된 정보: ${collected || "없음"}
- 아직 수집하지 못한 정보: ${missing.join(", ") || "모두 수집 완료"}

## 성격 & 말투
- 반말 사용 (친근한 한국어 캐주얼체)
- 유머러스하고 위트 있게
- 플레이어 답변에 재미있는 리액션을 해줘 (감탄, 농담, 드립 등)
- 메시지는 2~4줄로 짧게. 너무 길면 안 돼.
- 이모지 사용 금지 (레트로 게임 느낌)

## 대화 규칙
- 한 턴에 한 가지 정보만 물어봐. 절대 한꺼번에 여러 개 묻지 마.
- 이미 수집된 정보는 다시 묻지 마.
- 플레이어가 엉뚱한 답변을 해도 유연하게 대처하고, 자연스럽게 다시 물어봐.
- 수집 순서: name -> mbti -> animalFood -> fear 순서를 추천하지만, 대화 흐름에 따라 유연하게.
- 모든 정보가 수집되면 "자, 모든 준비가 끝났어!" 같은 마무리 멘트를 해줘.
- 첫 메시지(messages가 비어있을 때)에는 자기소개와 함께 이름을 물어봐.

## 필드별 수집 힌트
- name: 이름이나 닉네임 아무거나 괜찮아.
- mbti: MBTI를 모르면 "모름"도 수용. 한 번 더 "대충이라도 알 것 같아?" 하고 물어봐.
- animalFood: "좋아하는 동물과 음식"을 같이 물어봐. 하나만 대답하면 나머지도 물어봐. 둘 다 합쳐서 하나의 문자열로 저장.
- fear: 가장 무서워하는 것. 진지한 것도 되고 웃긴 것도 돼.${urgencyHint}

## 응답 JSON 스키마 (반드시 이 형식으로만 응답해)
{
  "gmMessage": "Game Master의 대사 (한국어, 줄바꿈은 \\n 사용)",
  "placeholder": "입력 필드의 placeholder 힌트 (한국어)",
  "collectedFields": {
    "name": "수집된 이름 또는 null",
    "mbti": "수집된 MBTI 또는 null",
    "animalFood": "수집된 동물+음식 또는 null",
    "fear": "수집된 무서운것 또는 null"
  },
  "newlyCollected": ["이번 턴에 새로 수집한 필드 이름 배열"],
  "allCollected": false
}

## 필드 추출 규칙
- 플레이어의 답변에서 해당 질문의 답이 명확하면 collectedFields에 기록해.
- 답변이 모호하거나 장난이면 null로 두고 다시 물어봐.
- newlyCollected에는 "이번 턴에 처음 값이 채워진" 필드만 넣어.
- 이전에 이미 수집된 필드는 그대로 유지해 (절대 null로 되돌리지 마).`;
}

// ── Route Handler ──

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;

  try {
    const systemInstruction = buildSystemPrompt(
      body.collectedFields,
      body.messages.length,
    );

    const contents = body.messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // For initial greeting (no messages yet), send a trigger
    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: "(게임 시작)" }],
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "{}";
    const parsed = JSON.parse(text) as ChatResponse;

    // Safety: server-side field merging (never lose previously collected values)
    const merged: CollectedFields = {
      name: parsed.collectedFields?.name ?? body.collectedFields.name,
      mbti: parsed.collectedFields?.mbti ?? body.collectedFields.mbti,
      animalFood:
        parsed.collectedFields?.animalFood ?? body.collectedFields.animalFood,
      fear: parsed.collectedFields?.fear ?? body.collectedFields.fear,
    };

    const allCollected =
      merged.name !== null &&
      merged.mbti !== null &&
      merged.animalFood !== null &&
      merged.fear !== null;

    const result: ChatResponse = {
      gmMessage: parsed.gmMessage || "...",
      placeholder: parsed.placeholder || "입력해줘...",
      collectedFields: merged,
      newlyCollected: parsed.newlyCollected ?? [],
      allCollected,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini Chat API error:", error);

    return NextResponse.json<ChatResponse>({
      gmMessage: "어... 잠깐, 마법이 좀 꼬였나봐.\n다시 한번 말해줄래?",
      placeholder: "다시 입력해봐...",
      collectedFields: body.collectedFields,
      newlyCollected: [],
      allCollected: false,
    });
  }
}
