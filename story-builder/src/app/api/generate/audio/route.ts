import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// user snippet에 따라 v1alpha 설정
const client = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
  apiVersion: "v1alpha"
} as any); // 타입 에러 우회

export async function POST(req: NextRequest) {
  try {
    const { mood, duration = 10 } = await req.json(); // 빠른 시연을 위해 기본 10초 생성

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    // 목표 생성 시간(초)에 필요한 바이트 수 계산 (48000Hz, Stereo, 16-bit PCM)
    // 48000 * 2(channels) * 2(bytes per sample) = 192000 bytes per second
    const sampleRate = 48000;
    const channels = 2;
    const targetBytes = sampleRate * channels * 2 * duration;
    
    let accumulatedBytes = 0;
    const chunks: Buffer[] = [];

    console.log(`[Lyria] 시작: ${duration}초 분량의 BGM을 생성합니다...`);

    await new Promise<void>(async (resolve, reject) => {
      try {
        const session = await client.live.music.connect({
          model: "models/lyria-realtime-exp",
          callbacks: {
            onmessage: (message: any) => {
              if (message.serverContent?.audioChunks) {
                for (const chunk of message.serverContent.audioChunks) {
                  const audioBuffer = Buffer.from(chunk.data, "base64");
                  chunks.push(audioBuffer);
                  accumulatedBytes += audioBuffer.length;

                  // 목표 용량에 도달하면 소켓 닫고 완료 처리
                  if (accumulatedBytes >= targetBytes) {
                    if (typeof session.close === 'function') {
                      session.close();
                    }
                    resolve();
                  }
                }
              }
            },
            onerror: (error: any) => {
              console.error("[Lyria] Live session error:", error);
              reject(error);
            },
            onclose: () => {
              console.log("[Lyria] 스트림 종료됨.");
              resolve();
            },
          },
        });

        await session.setWeightedPrompts({
          weightedPrompts: [
            { text: mood, weight: 1.0 },
          ],
        });

        await session.setMusicGenerationConfig({
          musicGenerationConfig: {
            bpm: 100,
            temperature: 1.0,
          } as any,
        });

        await session.play();
      } catch (err) {
        reject(err);
      }
    });

    console.log("[Lyria] 오디오 수집 완료. WAV 헤더 생성 중...");
    
    const pcmBuffer = Buffer.concat(chunks);
    
    // 수집된 PCM 데이터를 재생 가능한 WAV 포맷으로 인코딩
    const wavBuffer = Buffer.alloc(44 + pcmBuffer.length);
    
    // RIFF chunk descriptor
    wavBuffer.write('RIFF', 0);
    wavBuffer.writeUInt32LE(36 + pcmBuffer.length, 4);
    wavBuffer.write('WAVE', 8);
    // fmt sub-chunk
    wavBuffer.write('fmt ', 12);
    wavBuffer.writeUInt32LE(16, 16); // PCM size
    wavBuffer.writeUInt16LE(1, 20);  // AudioFormat = PCM
    wavBuffer.writeUInt16LE(channels, 22);
    wavBuffer.writeUInt32LE(sampleRate, 24);
    wavBuffer.writeUInt32LE(sampleRate * channels * 2, 28); // ByteRate
    wavBuffer.writeUInt16LE(channels * 2, 32); // BlockAlign
    wavBuffer.writeUInt16LE(16, 34); // BitsPerSample
    // data sub-chunk
    wavBuffer.write('data', 36);
    wavBuffer.writeUInt32LE(pcmBuffer.length, 40);
    
    // 실제 PCM 데이터 복사
    pcmBuffer.copy(wavBuffer, 44);

    return NextResponse.json({ 
      success: true, 
      audioData: wavBuffer.toString("base64"),
      mimeType: "audio/wav" 
    });

  } catch (error: any) {
    console.error("Lyria API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
