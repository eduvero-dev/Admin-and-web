import { useCallback, useRef } from "react";

/**
 * ElevenLabs Text-to-Speech Hook
 * Free tier: 10,000 characters/month
 * Sign up at: https://elevenlabs.io
 * Get API key from: https://elevenlabs.io/app/settings/api-keys
 *
 * Add to .env.local:
 * NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key_here
 */

interface ElevenLabsOptions {
  voiceId?: string; // Default: Rachel (pre-made voice)
  model?: string; // Default: eleven_monolingual_v1
  stability?: number; // 0-1, default 0.5
  similarityBoost?: number; // 0-1, default 0.75
}

export function useElevenLabsTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (
      text: string,
      options: ElevenLabsOptions = {}
    ): Promise<void> => {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        console.warn("ElevenLabs API key not found. Falling back to browser TTS.");
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const {
        voiceId = "21m00Tcm4TlvDq8ikWAM", // Rachel - natural female voice
        model = "eleven_monolingual_v1",
        stability = 0.5,
        similarityBoost = 0.75,
      } = options;

      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
            body: JSON.stringify({
              text,
              model_id: model,
              voice_settings: {
                stability,
                similarity_boost: similarityBoost,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Clean up blob URL after audio finishes
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (error) {
        console.error("ElevenLabs TTS error:", error);
        throw error;
      }
    },
    []
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speak, stop };
}

// Available high-quality voices (pre-made, free to use)
export const ELEVENLABS_VOICES = {
  rachel: "21m00Tcm4TlvDq8ikWAM", // Young female, natural
  domi: "AZnzlk1XvdvUeBnXmlld", // Young female, energetic
  bella: "EXAVITQu4vr4xnSDxMaL", // Young female, soft
  antoni: "ErXwobaYiN019PkySvjV", // Young male, balanced
  elli: "MF3mGyEYCl7XYWbV9V6O", // Young female, emotional
  josh: "TxGEqnHWrfWFTfGW9XjX", // Young male, deep
  arnold: "VR6AewLTigWG4xSOukaG", // Male, crisp
  adam: "pNInz6obpgDQGcFmaJgB", // Male, deep
  sam: "yoZ06aMxZJJ28mfd3POQ", // Young male, raspy
};
