import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SURVEY_FIELDS, GEMINI_MODEL, type Answers } from "@/constants/survey";
import { buildGenerateSystemPrompt, buildCharacterImagePrompt } from "@/constants/prompt/generate";
import { buildWorldPrompt } from "@/constants/prompt/world";
import type { GenerateResult } from "@/types/generate";
import type { StoryBible } from "@/types/story";
import type { WorldDNA } from "@/types/world";

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

async function generateWorldDna(storyBible: StoryBible): Promise<WorldDNA | null> {
  try {
    const prompt = buildWorldPrompt(storyBible);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text ?? "{}";
    return JSON.parse(text) as WorldDNA;
  } catch (error) {
    console.error("WorldDNA inline generation error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { storyBible, ...rest } = body as { storyBible?: StoryBible } & Answers;
    const data = rest as Answers;

    if (!SURVEY_FIELDS.every((key) => data[key])) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate World DNA if StoryBible is complete
    let worldDna: WorldDNA | null = null;
    if (storyBible?.is_complete) {
      worldDna = await generateWorldDna(storyBible);
    }

    const systemInstruction = buildGenerateSystemPrompt(data, worldDna ?? undefined);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
      config: { responseMimeType: "application/json" },
    });

    const responseText = response.text || "";
    const resultJson = JSON.parse(responseText) as GenerateResult;

    // 공통 스타일 앵커 + appearance + WorldDNA로 imagePrompt 합성
    for (const member of resultJson.party) {
      member.imagePrompt = buildCharacterImagePrompt(member.appearance, worldDna ?? undefined);
    }
    resultJson.boss.imagePrompt = buildCharacterImagePrompt(resultJson.boss.appearance, worldDna ?? undefined);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
