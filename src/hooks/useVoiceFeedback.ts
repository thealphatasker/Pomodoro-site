import { useCallback } from "react";

const ROASTS = [
  "I've seen slower reaction times from glaciers. Pick up the pace, human.",
  "Your eye movement suggests you're looking at that phone again. Don't make me disable your Wi-Fi.",
  "Is that a yawn? I didn't program yapping. Focus.",
  "Hey, stay focused.",
  "Your future is watching… get back to work.",
  "Stop looking around and finish your tasks.",
  "Discipline first, excuses later."
];

const MOTIVATIONS = [
  "Bio-metrics optimal. You are in the top 3% of neural focus today. Keep it up.",
  "Great work. Time for a short break.",
  "Relax your eyes and stretch for a few minutes.",
  "Step away from the screen and refresh yourself.",
  "Work smarter, not harder. You're doing great."
];

export function useVoiceFeedback() {
  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel existing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      // Find a professional male voice if possible
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes("Google US English Male") || v.name.includes("Daniel"));
      if (preferred) utterance.voice = preferred;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const roast = useCallback(() => {
    const text = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    speak(text);
    return text;
  }, [speak]);

  const motivate = useCallback((textOverride?: string) => {
    const text = textOverride || MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    speak(text);
    return text;
  }, [speak]);

  return { speak, roast, motivate };
}
