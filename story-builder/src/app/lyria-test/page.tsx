"use client";

import { useState } from "react";

export default function LyriaTestPage() {
  const [mood, setMood] = useState("Warm orchestral JRPG hero theme, gentle strings with driving percussion, hopeful and brave");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMusic = async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, duration: 30 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "음악 생성에 실패했습니다.");
      }

      // Base64 데이터를 Blob으로 변환하여 재생 가능한 URL 생성
      const byteCharacters = atob(data.audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-[family-name:var(--font-pixel)]">
      <h1 className="text-2xl mb-8 text-purple-400 border-b border-purple-900 pb-2">
        Lyria 3 Music Generation Test
      </h1>

      <div className="max-w-2xl bg-[#111] border border-gray-800 p-6 rounded-lg">
        <div className="mb-6">
          <label className="block text-sm mb-2 text-gray-400">음악 무드 프롬프트 (English)</label>
          <textarea
            className="w-full bg-black border border-gray-700 p-3 rounded text-sm focus:border-purple-500 outline-none h-32"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
        </div>

        <button
          onClick={generateMusic}
          disabled={isLoading}
          className={`w-full py-3 rounded font-bold transition-all ${
            isLoading 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-purple-600 hover:bg-purple-500 active:scale-95"
          }`}
        >
          {isLoading ? "음악 생성 중... (약 10~20초 소요)" : "음악 생성하기"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded">
            Error: {error}
          </div>
        )}

        {audioUrl && (
          <div className="mt-8 p-6 bg-purple-900/20 border border-purple-800 rounded-lg animate-pulse">
            <h3 className="text-lg mb-4 text-purple-300">성공! 생성된 음악 재생</h3>
            <audio controls src={audioUrl} className="w-full" autoPlay />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Lyria 3 모델이 생성한 개인화 테마곡입니다.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 text-xs text-gray-600">
        <p>※ 주의: Lyria API 권한이 활성화된 GOOGLE_GENERATIVE_AI_API_KEY가 필요합니다.</p>
        <p>※ 모델명 `lyria-002`는 현재 사용 가능한 환경에 따라 다를 수 있습니다.</p>
      </div>
    </div>
  );
}
