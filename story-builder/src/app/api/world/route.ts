import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "@/constants/survey";
import { buildWorldPrompt } from "@/constants/prompt/world";
import type { StoryBible } from "@/types/story";
import type { WorldDNA } from "@/types/world";

let _ai: GoogleGenAI;
const ai = () => (_ai ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! }));

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { storyBible: StoryBible };

  try {
    const prompt = buildWorldPrompt(body.storyBible);

    const response = await ai().models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text ?? "{}";
    const worldDna = JSON.parse(text) as WorldDNA;
    return NextResponse.json(worldDna);
  } catch (error) {
    console.error("World DNA generation error:", error);
    return NextResponse.json({ error: "World DNA generation failed" }, { status: 500 });
  }
}
