const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const envContent = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_AI_API_KEY=([^\n]+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.GOOGLE_AI_API_KEY;

const client = new GoogleGenAI({ 
  apiKey: apiKey,
  apiVersion: "v1alpha"
});

async function run() {
  console.log("Connecting to Lyria Live API...");
  let byteCount = 0;
  let hasError = false;

  try {
    const session = await client.live.music.connect({
      model: "models/lyria-realtime-exp",
      callbacks: {
        onmessage: (msg) => {
          console.log("Raw msg:", JSON.stringify(msg).slice(0, 500));
          if (msg.serverContent && msg.serverContent.audioChunks) {
            msg.serverContent.audioChunks.forEach(chunk => {
              const buf = Buffer.from(chunk.data, 'base64');
              byteCount += buf.length;
              console.log(`[Lyria Chunk] received ${buf.length} bytes. Total: ${byteCount}`);
            });
          } else {
             console.log("Other message:", JSON.stringify(msg));
          }
        },
        onerror: (err) => {
          console.error("Live Session Error:", err);
          hasError = true;
        },
        onclose: (e) => console.log("Stream closed. Event:", e)
      }
    });

    console.log("Connected. Configuring session...");
    await session.setWeightedPrompts({
      weightedPrompts: [{ text: "Epic boss battle music", weight: 1.0 }]
    });

    await session.setMusicGenerationConfig({
      musicGenerationConfig: {
        bpm: 100,
        temperature: 1.0
      }
    });

    console.log("Sending Play command...");
    await session.play();

    // 15초 뒤 강제 종료
    setTimeout(() => {
        console.log("15 seconds passed. Stopping...");
        if (!hasError) session.close();
        process.exit(0);
    }, 15000);

  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

run();