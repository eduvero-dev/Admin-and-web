import { useEffect, useRef, useCallback, useState } from "react";

export function useReadAloud(enabled: boolean) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      if (availableVoices.length > 0) {
        setVoices(availableVoices);

        // Auto-select the best quality voice
        // Priority: Google voices > Premium voices > Neural voices > Default
        const bestVoice =
          // Try to find Google US English voices (high quality)
          availableVoices.find((v) => v.name.includes("Google US English")) ||
          availableVoices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
          // Try to find premium/enhanced voices
          availableVoices.find((v) => v.name.includes("Premium") && v.lang.startsWith("en")) ||
          availableVoices.find((v) => v.name.includes("Enhanced") && v.lang.startsWith("en")) ||
          // Try to find neural voices (Microsoft, Apple)
          availableVoices.find((v) => v.name.includes("Neural") && v.lang.startsWith("en")) ||
          // Try Samantha (high quality macOS voice)
          availableVoices.find((v) => v.name.includes("Samantha")) ||
          // Try Microsoft natural voices
          availableVoices.find((v) => v.name.includes("Zira") || v.name.includes("David")) ||
          // Try UK natural voices as fallback
          availableVoices.find((v) => (v.name.includes("Daniel") || v.name.includes("Karen")) && v.lang.startsWith("en")) ||
          // Finally, just get first English voice
          availableVoices.find((v) => v.lang.startsWith("en"));

        if (bestVoice) {
          setSelectedVoice(bestVoice);
        }
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cancel any ongoing speech when component unmounts or when disabled
  useEffect(() => {
    if (!enabled) {
      window.speechSynthesis.cancel();
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [enabled]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create new utterance with enhanced settings
      const utterance = new SpeechSynthesisUtterance(text);

      // Use selected voice for more natural speech
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Optimized settings for natural speech
      utterance.rate = 0.95; // Slightly slower for better comprehension
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1.0; // Full volume

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [enabled, selectedVoice]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return { speak, stop, voices, selectedVoice, changeVoice };
}
