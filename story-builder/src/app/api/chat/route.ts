import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
  SURVEY_FIELDS,
  GEMINI_MODEL,
  createEmptyFields,
  isAllCollected,
  type CollectedFields,
} from "@/constants/survey";
import { buildChatSystemPrompt } from "@/constants/prompt/chat";

// ── Types ──

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
  gmPose: string;
}

// ── Gemini Client ──

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

// ── Route Handler ──

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;

  try {
    const systemInstruction = buildChatSystemPrompt(
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
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "{}";
    const parsed = JSON.parse(text) as ChatResponse;

    // Safety: server-side field merging (never lose previously collected values)
    const merged = { ...createEmptyFields() };
    for (const key of SURVEY_FIELDS) {
      merged[key] = parsed.collectedFields?.[key] ?? body.collectedFields[key];
    }

    const allCollected = isAllCollected(merged);

    const result: ChatResponse = {
      gmMessage: parsed.gmMessage || "...",
      placeholder: parsed.placeholder || "입력해줘...",
      collectedFields: merged,
      newlyCollected: parsed.newlyCollected ?? [],
      allCollected,
      gmPose: parsed.gmPose || "idle",
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
      gmPose: "idle",
    });
  }
}
