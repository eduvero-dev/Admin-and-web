import { useCallback } from "react";
import { useReadAloud } from "./useReadAloud";
import { useElevenLabsTTS, ELEVENLABS_VOICES } from "./useElevenLabsTTS";

/**
 * Hybrid TTS Hook
 * Uses enhanced browser voices by default (free, no API key needed)
 * Falls back to ElevenLabs if API key is provided in .env.local
 */

export function useHumanizedTTS(enabled: boolean) {
  const browserTTS = useReadAloud(enabled);
  const elevenLabsTTS = useElevenLabsTTS();
  const hasElevenLabsKey = !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  const speak = useCallback(
    async (text: string) => {
      if (!enabled || !text.trim()) return;

      // Use ElevenLabs if API key is configured (most human)
      if (hasElevenLabsKey) {
        try {
          await elevenLabsTTS.speak(text, {
            voiceId: ELEVENLABS_VOICES.rachel, // Natural female voice
            stability: 0.5,
            similarityBoost: 0.75,
          });
          return;
        } catch (error) {
          console.warn("ElevenLabs failed, falling back to browser TTS:", error);
          // Fall through to browser TTS
        }
      }

      // Use enhanced browser TTS (100% free)
      browserTTS.speak(text);
    },
    [enabled, hasElevenLabsKey, browserTTS, elevenLabsTTS]
  );

  const stop = useCallback(() => {
    browserTTS.stop();
    elevenLabsTTS.stop();
  }, [browserTTS, elevenLabsTTS]);

  return {
    speak,
    stop,
    voices: browserTTS.voices,
    selectedVoice: browserTTS.selectedVoice,
    changeVoice: browserTTS.changeVoice,
    isUsingPremium: hasElevenLabsKey,
  };
}
