import React from "react";
import { motion } from "motion/react";
import { Brain, Target, Zap, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useApp } from "../contexts/AppContext";

export default function Dashboard() {
  const { weeklyScores, sessions } = useApp();

  const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgFocusScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length,
        )
      : 85;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Metrics Row */}
      <div className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-8 flex flex-col min-h-[400px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Brain className="w-48 h-48 text-primary" />
        </div>

        <div className="flex justify-between items-start mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-on-surface-variant/60 mb-2">
              Neural Telemetry
            </p>
            <h3 className="text-3xl font-bold tracking-tight">
              Focus Score Trend
            </h3>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
              LIVE DATA
            </span>
            <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant/60 text-[10px] rounded-full uppercase tracking-tighter">
              Last 7 Cycles
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyScores}>
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {weeklyScores.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score > 90 ? "#c3c0ff" : "#4f46e5"}
                    fillOpacity={0.6}
                    className="hover:fill-opacity-100 transition-all duration-300 cursor-pointer"
                  />
                ))}
              </Bar>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(199, 196, 216, 0.4)",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "#1c1b1b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus Hours Today */}
      <div className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-8 flex flex-col justify-center text-center relative overflow-hidden group">
        <Target className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-on-surface-variant/60">
          Neural Uptime
        </p>
        <div className="mt-8">
          <span className="text-[80px] font-bold text-primary cobalt-glow tracking-tighter leading-none">
            {formatTime(totalFocusTime)}
          </span>
          <p className="text-secondary font-bold text-sm mt-4">
            +{avgFocusScore}% vs. Elite Baseline
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest mb-1">
              Deep State
            </p>
            <p className="text-xl font-bold">
              {formatTime(Math.floor(totalFocusTime * 0.65))}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest mb-1">
              Shallow
            </p>
            <p className="text-xl font-bold">
              {formatTime(Math.floor(totalFocusTime * 0.35))}
            </p>
          </div>
        </div>
      </div>

      {/* Consistency Metrics */}
      <div className="col-span-12 lg:col-span-5 glass-panel rounded-3xl p-8 space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold uppercase tracking-wider text-sm">
            Attention Consistency
          </h4>
          <Zap className="text-secondary w-5 h-5 fill-current" />
        </div>

        <div className="space-y-8">
          {[
            { label: "Eye Contact Ratio", value: 92, color: "bg-primary" },
            { label: "Posture Stability", value: 78, color: "bg-primary" },
            {
              label: "Micro-Distractions",
              value: 15,
              color: "bg-secondary",
              inverted: true,
            },
          ].map((metric, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>{metric.label}</span>
                <span>{metric.inverted ? "LOW" : `${metric.value}%`}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  className={`h-full ${metric.color} shadow-[0_0_10px_currentColor]`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-xs text-primary-fixed italic leading-relaxed">
            "Neural activity peaks between 10:00 AM and 11:30 AM. Align
            high-complexity matrix operations within this window."
          </p>
        </div>
      </div>

      {/* Daily Cycle Breakdown */}
      <div className="col-span-12 lg:col-span-7 glass-panel rounded-3xl p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-bold uppercase tracking-wider text-sm">
            Chronotype Sync
          </h4>
          <button className="text-xs text-primary hover:underline">
            Export Logs
          </button>
        </div>

        <div className="flex-1 flex items-center gap-1 min-h-[140px]">
          <div className="h-full w-[45%] bg-primary/20 border-x border-primary/20 flex items-center justify-center group relative cursor-help">
            <span className="text-[10px] font-bold text-primary opacity-60">
              WORK (90m)
            </span>
          </div>
          <div className="h-3/4 w-[10%] bg-secondary/10 border-x border-secondary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-secondary opacity-60">
              15m
            </span>
          </div>
          <div className="h-full w-[30%] bg-primary/20 border-x border-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary opacity-60">
              60m
            </span>
          </div>
          <div className="h-2/4 w-[15%] bg-secondary/10 border-x border-secondary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-secondary opacity-60">
              30m
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant/60">
                FOCUS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-[10px] font-bold text-on-surface-variant/60">
                RECOVERY
              </span>
            </div>
          </div>
          <Download className="w-4 h-4 text-on-surface-variant/40" />
        </div>
      </div>
    </div>
  );
}
