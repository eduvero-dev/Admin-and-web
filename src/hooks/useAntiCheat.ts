"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAssessmentStore } from "@/store/assessmentStore";

interface UseAntiCheatOptions {
  onWarn: () => void;
  onAutoSubmit: () => void;
  active: boolean;
}

export function useAntiCheat({ onWarn, onAutoSubmit, active }: UseAntiCheatOptions) {
  const { tabSwitchCount, incrementTabSwitch } = useAssessmentStore();
  const countRef = useRef(tabSwitchCount);
  countRef.current = tabSwitchCount;

  const handleViolation = useCallback(() => {
    if (!active) return;
    const newCount = countRef.current + 1;
    incrementTabSwitch();
    if (newCount === 1) {
      onWarn();
    } else {
      onAutoSubmit();
    }
  }, [active, incrementTabSwitch, onWarn, onAutoSubmit]);

  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleBlur = () => {
      handleViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Exiting fullscreen is a violation
        handleViolation();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [active, handleViolation]);
}
