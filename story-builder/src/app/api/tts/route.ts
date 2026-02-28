import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const TTS_MODEL = "gemini-2.5-flash-preview-tts";
let _ai: GoogleGenAI;
const ai = () => (_ai ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! }));

/** Wrap raw PCM (16-bit LE mono) in a WAV container so browsers can play it. */
function pcmToWav(pcmBase64: string, sampleRate: number): string {
  const pcm = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]).toString("base64");
}

/** Extract sample rate from mimeType like "audio/L16;codec=pcm;rate=24000" */
function parseSampleRate(mime: string): number {
  const match = mime.match(/rate=(\d+)/);
  return match ? parseInt(match[1], 10) : 24000;
}

export async function POST(request: NextRequest) {
  const { text, voiceName = "Charon", tone } = (await request.json()) as {
    text: string;
    voiceName?: string;
    tone?: string;
  };

  // Gemini TTS reads text literally — embed tone as a leading stage direction
  const prompt = tone ? `${tone}:\n${text}` : text;

  try {
    const response = await ai().models.generateContent({
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

    const rawMime = audioPart.inlineData.mimeType ?? "";
    const isRawPcm = rawMime.includes("L16") || rawMime.includes("pcm");

    if (isRawPcm) {
      const sampleRate = parseSampleRate(rawMime);
      const wavBase64 = pcmToWav(audioPart.inlineData.data, sampleRate);
      return NextResponse.json({ audioData: wavBase64, mimeType: "audio/wav" });
    }

    return NextResponse.json({
      audioData: audioPart.inlineData.data,
      mimeType: rawMime || "audio/wav",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("TTS error:", msg);
    return NextResponse.json({ error: "TTS failed", detail: msg }, { status: 500 });
  }
}
