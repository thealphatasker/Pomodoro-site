import React, { useState } from "react";
import { Timer, Brain, Activity, ShieldCheck, Play } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../contexts/AppContext";

export default function Sessions() {
  const { settings, updateSettings } = useApp();
  const [workMinutes, setWorkMinutes] = useState(settings.workMinutes);
  const [breakMinutes, setBreakMinutes] = useState(settings.breakMinutes);

  const handleSaveAndStart = () => {
    updateSettings({
      workMinutes,
      breakMinutes,
    });
    // Navigate to focus view would go here if using router
    window.dispatchEvent(new CustomEvent("navigate-to-focus"));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Temporal Logic</h2>
        <p className="text-on-surface-variant">
          Configure deep work and recovery cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <section className="md:col-span-8 glass-panel p-10 rounded-3xl flex flex-col gap-12">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] text-primary font-bold tracking-[0.3em] uppercase">
                Phase Calibration
              </span>
              <p className="text-lg font-medium">Neural Flow Ratios</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-full">
              <span className="text-primary text-xs font-bold uppercase tracking-tighter">
                Current: {workMinutes} / {breakMinutes} Elite
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
            <div className="space-y-6">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Work Interval
              </label>
              <div className="flex items-center justify-between border-b border-surface-variant pb-4">
                <span className="text-7xl font-bold text-primary tracking-tighter">
                  {workMinutes}
                </span>
                <span className="text-2xl font-bold text-on-surface-variant">
                  MIN
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-1 bg-surface-container-highest rounded-full"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(Number(e.target.value))}
                min={15}
                max={120}
              />
            </div>

            <div className="space-y-6">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Rest Interval
              </label>
              <div className="flex items-center justify-between border-b border-surface-variant pb-4">
                <span className="text-7xl font-bold text-secondary tracking-tighter">
                  {breakMinutes}
                </span>
                <span className="text-2xl font-bold text-on-surface-variant">
                  MIN
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-secondary h-1 bg-surface-container-highest rounded-full"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                min={5}
                max={45}
              />
            </div>
          </div>
        </section>

        <section className="md:col-span-4 glass-panel p-10 rounded-3xl relative overflow-hidden flex flex-col gap-6">
          <div className="absolute inset-0 opacity-10 bg-linear-to-br from-primary/20 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold">Vision Calibration</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Neural Face Tracking Active
            </p>
          </div>

          <div className="relative aspect-square rounded-2xl border border-white/5 overflow-hidden bg-black flex items-center justify-center group cursor-pointer">
            <img
              src="https://picsum.photos/seed/tech/400/400?grayscale"
              className="w-full h-full object-cover opacity-30 grayscale brightness-75 transition-all group-hover:scale-110"
              referrerPolicy="no-referrer"
              alt="Tracking preview"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border border-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_10px_#c3c0ff] rounded-full" />
              </div>
            </div>
            {/* HUD Elements */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary/40" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary/40" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary/40" />
          </div>

          <div className="flex items-center gap-4 bg-surface-container/50 p-4 rounded-xl border border-primary/10">
            <Activity className="text-secondary w-5 h-5 animate-pulse" />
            <span className="text-xs text-secondary font-bold uppercase tracking-widest leading-none">
              Tracking Signal: Optimized
            </span>
          </div>
        </section>

        <section className="col-span-12 glass-panel p-10 rounded-3xl space-y-8">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Assistant Personality</h3>
            <p className="text-on-surface-variant">
              Select the behavioral algorithm for your AETHER guide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Supportive",
                value: "supportive",
                icon: Brain,
                color: "text-secondary",
                bg: "bg-secondary/10",
                desc: "Gentle reminders and positive reinforcement. Focuses on burnout prevention.",
              },
              {
                title: "Strict",
                value: "strict",
                icon: ShieldCheck,
                color: "text-primary",
                bg: "bg-primary/20",
                desc: "Zero-tolerance for distractions. Hard breaks and immediate focus alerts.",
              },
              {
                title: "Roast-Heavy",
                value: "roast",
                icon: Activity,
                color: "text-error",
                bg: "bg-error/10",
                desc: "Psychological warfare. Mockery and shame tactics to drive productivity.",
              },
            ].map((personality) => (
              <button
                key={personality.value}
                onClick={() =>
                  updateSettings({ personality: personality.value as any })
                }
                className={`p-8 rounded-2xl flex flex-col gap-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] border ${
                  settings.personality === personality.value
                    ? `${personality.bg} border-current active-glow`
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${personality.bg} border border-current opacity-60`}
                >
                  <personality.icon
                    className={`w-6 h-6 ${personality.color}`}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className={`text-lg font-bold ${personality.color}`}>
                    {personality.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed opacity-80">
                    {personality.desc}
                  </p>
                </div>
                {settings.personality === personality.value && (
                  <div className="mt-auto flex items-center gap-2 text-primary">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Active Model
                    </span>
                    <Brain className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleSaveAndStart}
          className="px-16 py-6 bg-primary text-[#1d00a5] font-bold text-2xl rounded-full active-glow shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4"
        >
          <Play className="w-8 h-8 fill-current" />
          INITIALIZE DEEP WORK
        </button>
      </div>
    </div>
  );
}
