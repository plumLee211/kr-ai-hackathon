import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SURVEY_FIELDS, GEMINI_MODEL, type Answers } from "@/constants/survey";
import { buildGenerateSystemPrompt } from "@/constants/prompt/generate";
import type { GenerateResult } from "@/types/generate";

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  try {
    const data: Answers = await req.json();

    if (!SURVEY_FIELDS.every((key) => data[key])) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemInstruction = buildGenerateSystemPrompt(data);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] }
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const resultJson: GenerateResult = JSON.parse(responseText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
