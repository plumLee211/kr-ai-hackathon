import {
  GoogleGenAI,
  LiveMusicServerMessage,
  LiveMusicSession,
} from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const BGM_MODEL = "models/lyria-realtime-exp";
const SAMPLE_RATE = 48000;
const NUM_CHANNELS = 2; // stereo
const BITS_PER_SAMPLE = 16;
const COLLECT_DURATION_MS = 30_000;

/** Wrap raw PCM (16-bit LE stereo) in a WAV container so browsers can play it. */
function pcmToWav(pcmBuffer: Buffer, sampleRate: number, numChannels: number): string {
  const byteRate = sampleRate * numChannels * (BITS_PER_SAMPLE / 8);
  const blockAlign = numChannels * (BITS_PER_SAMPLE / 8);

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]).toString("base64");
}

export async function POST(request: NextRequest) {
  const { prompt, bpm = 90 } = (await request.json()) as {
    prompt: string;
    bpm?: number;
  };

  // apiVersion: "v1alpha" is required for Lyria RealTime
  const client = new GoogleGenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY!,
    apiVersion: "v1alpha",
  });

  try {
    const pcmChunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      let session: LiveMusicSession | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const stopSession = async () => {
        if (timer) clearTimeout(timer);
        try {
          if (session) session.stop();
        } catch {
          // ignore stop errors
        }
        resolve();
      };

      console.log("[BGM] Connecting to Lyria RealTime...");
      client.live.music
        .connect({
          model: BGM_MODEL,
          callbacks: {
            onmessage: (msg: LiveMusicServerMessage) => {
              if (msg.setupComplete) {
                console.log("[BGM] Setup complete");
              }
              const chunks = msg.serverContent?.audioChunks;
              if (chunks) {
                for (const chunk of chunks) {
                  if (chunk.data) {
                    pcmChunks.push(Buffer.from(chunk.data, "base64"));
                  }
                }
                if (pcmChunks.length % 50 === 0) {
                  console.log(`[BGM] Collected ${pcmChunks.length} chunks`);
                }
              }
            },
            onerror: (err: ErrorEvent) => {
              console.error("[BGM] WebSocket error:", err);
              if (timer) clearTimeout(timer);
              reject(new Error(err.message ?? String(err)));
            },
            onclose: () => {
              console.log(`[BGM] Connection closed. Total chunks: ${pcmChunks.length}`);
              if (timer) clearTimeout(timer);
              resolve();
            },
          },
        })
        .then(async (s: LiveMusicSession) => {
          session = s;
          console.log("[BGM] Connected. Setting prompts...");
          await session.setWeightedPrompts({
            weightedPrompts: [{ text: prompt, weight: 1.0 }],
          });
          await session.setMusicGenerationConfig({
            musicGenerationConfig: { bpm, temperature: 1.0 },
          });
          console.log("[BGM] Playing...");
          session.play();
          timer = setTimeout(stopSession, COLLECT_DURATION_MS);
        })
        .catch((err) => {
          console.error("[BGM] Connect/setup error:", err);
          reject(err);
        });
    });

    if (pcmChunks.length === 0) {
      return NextResponse.json({ error: "No audio generated" }, { status: 500 });
    }

    const pcmBuffer = Buffer.concat(pcmChunks);
    const wavBase64 = pcmToWav(pcmBuffer, SAMPLE_RATE, NUM_CHANNELS);

    return NextResponse.json({ audioData: wavBase64, mimeType: "audio/wav" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("BGM error:", msg);
    return NextResponse.json({ error: "BGM generation failed", detail: msg }, { status: 500 });
  }
}
