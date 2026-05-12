import { useState, useEffect } from "react";

export type TimerMode = "work" | "break";

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  isStrict: boolean;
  personality: "supportive" | "strict" | "roast";
}

export function usePomodoro(settings: PomodoroSettings) {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Switch mode
      const nextMode = mode === "work" ? "break" : "work";
      setMode(nextMode);
      setTimeLeft((nextMode === "work" ? settings.workMinutes : settings.breakMinutes) * 60);
      setIsActive(false);
      // Play sound notification (handled in component)
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, settings]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60);
  };

  const skipMode = () => {
    const nextMode = mode === "work" ? "break" : "work";
    setMode(nextMode);
    setTimeLeft((nextMode === "work" ? settings.workMinutes : settings.breakMinutes) * 60);
    setIsActive(false);
  };

  return {
    isActive,
    mode,
    timeLeft,
    toggleTimer,
    resetTimer,
    skipMode,
    setTimeLeft
  };
}
