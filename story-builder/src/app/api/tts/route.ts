import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

export async function POST(request: NextRequest) {
  const { text, voiceName = "Kore", tone } = (await request.json()) as {
    text: string;
    voiceName?: string;
    tone?: string;
  };

  // Gemini TTS reads text literally — embed tone as a leading stage direction
  const prompt = tone ? `${tone}:\n${text}` : text;

  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const audioPart = parts.find((p) => p.inlineData?.data);

    if (!audioPart?.inlineData?.data) {
      return NextResponse.json({ error: "No audio generated" }, { status: 500 });
    }

    return NextResponse.json({
      audioData: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType ?? "audio/wav",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("TTS error:", msg);
    return NextResponse.json({ error: "TTS failed", detail: msg }, { status: 500 });
  }
}
