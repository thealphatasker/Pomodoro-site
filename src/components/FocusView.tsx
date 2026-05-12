import React, { useRef, useState, useEffect, Component } from "react";
import type { ReactNode } from "react";
import Webcam from "react-webcam";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Check,
  Bolt,
  MessageSquare,
  Send,
  CameraOff,
  X,
  Plus,
} from "lucide-react";
import { usePomodoro } from "../hooks/usePomodoro";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useVoiceFeedback } from "../hooks/useVoiceFeedback";
import { Companion3D } from "./Companion3D";
import { useApp } from "../contexts/AppContext";

// Error boundary to prevent 3D canvas crashes from blacking out the whole page
class SafeCanvas extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40 text-xs uppercase tracking-widest">
            3D Companion Unavailable
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default function FocusView() {
  const { settings, tasks, toggleTask, addTask, removeTask, addSession } =
    useApp();
  const { mode, timeLeft, isActive, toggleTimer, resetTimer, skipMode } =
    usePomodoro(settings);
  const videoRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const {
    isLookingAway,
    isLoaded: isModelLoaded,
    expression,
    debugInfo,
  } = useFaceDetection(
    !cameraError ? (videoRef.current?.video as HTMLVideoElement | null) : null,
    isActive && mode === "work" && settings.isStrict && !cameraError,
  );

  const { speak, roast, motivate } = useVoiceFeedback();
  const [logs, setLogs] = useState<
    { time: string; msg: string; type: "roast" | "motivation" | "system" }[]
  >([
    {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      msg: "Bio-metrics optimal. Focus session ready.",
      type: "system",
    },
  ]);

  const lastRoastTime = useRef(0);
  const sessionStartTime = useRef<number | null>(null);
  const distractionCount = useRef(0);

  // Auto-roast when looking away during work
  useEffect(() => {
    if (isLookingAway && isActive && mode === "work" && settings.isStrict) {
      const now = Date.now();
      if (now - lastRoastTime.current > 10000) {
        // Roast every 10s if looking away
        const msg = roast();
        setLogs((prev) =>
          [
            {
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              msg,
              type: "roast" as const,
            },
            ...prev,
          ].slice(0, 5),
        );
        lastRoastTime.current = now;
        distractionCount.current++;
      }
    }
  }, [isLookingAway, isActive, mode, settings.isStrict, roast]);

  // Track session start
  useEffect(() => {
    if (isActive && mode === "work" && !sessionStartTime.current) {
      sessionStartTime.current = Date.now();
      distractionCount.current = 0;
    }
  }, [isActive, mode]);

  // Save session when work phase ends
  useEffect(() => {
    if (!isActive && mode === "break" && sessionStartTime.current) {
      const duration = Math.floor(
        (Date.now() - sessionStartTime.current) / 60000,
      );
      const focusScore = Math.max(20, 100 - distractionCount.current * 5);

      addSession({
        date: new Date().toISOString(),
        duration,
        focusScore,
        distractions: distractionCount.current,
      });

      sessionStartTime.current = null;
      distractionCount.current = 0;

      // Motivate on break
      const msg = motivate();
      setLogs((prev) =>
        [
          {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            msg,
            type: "motivation" as const,
          },
          ...prev,
        ].slice(0, 5),
      );
    }
  }, [isActive, mode, addSession, motivate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        subtitle: "User Created • Active",
        status: "pending",
      });
      setNewTaskTitle("");
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Timer & Core Card */}
      <div className="col-span-12 lg:col-span-7 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
        <div className="absolute inset-0 opacity-5 bg-linear-to-br from-primary to-transparent" />

        <div className="relative z-10 text-center w-full max-w-sm">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs uppercase tracking-[0.4em] font-bold mb-8 block ${mode === "work" ? "text-primary" : "text-secondary"}`}
          >
            {mode === "work" ? "Deep Work Phase" : "Recovery Phase"}
          </motion.span>

          <div className="font-bold text-[120px] text-primary cobalt-glow tabular-nums leading-none tracking-tighter">
            {formatTime(timeLeft)}
          </div>

          <div className="mt-12 flex gap-8 items-center justify-center">
            <button
              onClick={skipMode}
              className="p-4 rounded-full border border-white/5 hover:bg-white/5 transition-all text-on-surface-variant hover:text-white"
              title="Skip"
            >
              <FastForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleTimer}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active-glow ${
                isActive
                  ? "bg-surface-container border border-primary/20 text-primary"
                  : "bg-primary text-on-primary"
              }`}
            >
              {isActive ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-1" />
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-4 rounded-full border border-white/5 hover:bg-white/5 transition-all text-on-surface-variant hover:text-white"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-12 w-full h-1 bg-surface-container rounded-full relative overflow-hidden">
            <motion.div
              className={`absolute left-0 top-0 h-full ${mode === "work" ? "bg-primary shadow-[0_0_8px_rgba(195,192,255,0.6)]" : "bg-secondary"}`}
              initial={{ width: "0%" }}
              animate={{
                width: `${(timeLeft / (settings[mode === "work" ? "workMinutes" : "breakMinutes"] * 60)) * 100}%`,
              }}
              transition={{ type: "tween" }}
            />
          </div>
        </div>
      </div>

      {/* Companion Card */}
      <div className="col-span-12 lg:col-span-5 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col">
        <div className="absolute top-6 left-8 z-20 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 w-fit tracking-wider uppercase">
            AETHER v2.0
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`flex h-2 w-2 rounded-full ${isModelLoaded ? "bg-secondary animate-pulse" : "bg-on-surface-variant/30"}`}
            />
            <span className="text-[10px] text-on-surface-variant/60 tracking-[0.15em] font-medium uppercase italic">
              {cameraError ? "Camera Unavailable" : "Bio-Metric Sync Active"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative -mx-8">
          <SafeCanvas>
            <Companion3D
              isWorking={mode === "work" && isActive}
              isDistracted={isLookingAway}
              expression={expression}
            />
          </SafeCanvas>

          {/* Monitor Status Overlay */}
          <div className="absolute bottom-4 right-8 z-20 text-right space-y-1">
            <p className="text-[10px] font-mono text-on-surface-variant/60 uppercase">
              Attn:{" "}
              <span className={isLookingAway ? "text-error" : "text-secondary"}>
                {isLookingAway ? "0%" : "100%"}
              </span>
            </p>
            <p className="text-[8px] font-mono text-on-surface-variant/40">
              Model:{" "}
              <span className={isModelLoaded ? "text-secondary" : "text-error"}>
                {isModelLoaded ? "READY" : "LOADING"}
              </span>
            </p>
            <p className="text-[8px] font-mono text-on-surface-variant/40">
              Tracking:{" "}
              <span
                className={
                  isActive && mode === "work"
                    ? "text-secondary"
                    : "text-on-surface-variant/40"
                }
              >
                {isActive && mode === "work" ? "ACTIVE" : "IDLE"}
              </span>
            </p>
            <p className="text-[7px] font-mono text-on-surface-variant/30 max-w-[150px] text-right">
              {debugInfo}
            </p>
          </div>
        </div>

        <div className="h-24 glass-panel -mx-8 -mb-8 border-0 border-t border-white/5 p-6 flex items-center gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                Status:{" "}
                <span
                  className={
                    isActive ? "text-secondary" : "text-on-surface-variant"
                  }
                >
                  {isActive ? "MONITORING" : "READY"}
                </span>
              </p>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isLookingAway ? "bg-error" : "bg-secondary"} shadow-[0_0_12px_rgba(78,222,163,0.4)]`}
                animate={{ width: isLookingAway ? "5%" : "100%" }}
              />
            </div>
            <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-tighter">
              Companion State:{" "}
              <span className="text-secondary">
                {mode === "work" ? "Analytical" : "Supportive"}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const msg = roast();
                setLogs((prev) =>
                  [
                    {
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      msg,
                      type: "roast" as const,
                    },
                    ...prev,
                  ].slice(0, 5),
                );
              }}
              className="p-3 rounded-xl border border-error/20 hover:bg-error/10 transition-all bg-surface-container/30 group"
              title="Roast Me"
            >
              <Bolt className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => {
                const msg = motivate();
                setLogs((prev) =>
                  [
                    {
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      msg,
                      type: "motivation" as const,
                    },
                    ...prev,
                  ].slice(0, 5),
                );
              }}
              className="p-3 rounded-xl border border-secondary/20 hover:bg-secondary/10 transition-all bg-surface-container/30 group"
              title="Motivate Me"
            >
              <MessageSquare className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Camera Element for tracking */}
        <div className="absolute top-4 right-8 w-24 aspect-video rounded-xl overflow-hidden border border-white/10 opacity-30 brightness-50 hover:opacity-100 transition-all z-10">
          {cameraError ? (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <CameraOff className="w-6 h-6 text-on-surface-variant/40" />
            </div>
          ) : (
            <Webcam
              ref={videoRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
                frameRate: { ideal: 30 },
              }}
              className="w-full h-full object-cover"
              onUserMedia={() => {
                console.log("Camera started successfully");
                // Ensure video is playing
                if (videoRef.current?.video) {
                  videoRef.current.video
                    .play()
                    .catch((e) => console.error("Video play error:", e));
                }
              }}
              onUserMediaError={(error) => {
                console.error("Camera error:", error);
                setCameraError(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="col-span-12 lg:col-span-6 glass-panel rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold tracking-tight">Active Matrix</h3>
          <span className="text-xs text-primary font-medium tracking-wide">
            {completedTasks.length} of {tasks.length} Syncs
          </span>
        </div>

        {/* Add Task Input */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Add new task..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/30 transition-all"
          />
          <button
            onClick={handleAddTask}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                task.status === "completed"
                  ? "bg-white/5 border-transparent opacity-50"
                  : "bg-white/5 border-white/5 hover:border-primary/20"
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  task.status === "completed"
                    ? "bg-primary border-primary"
                    : "border-primary/30 hover:border-primary/50"
                }`}
              >
                {task.status === "completed" && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}
                >
                  {task.title}
                </p>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider">
                  {task.subtitle}
                </p>
              </div>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-error/10 text-error transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation Feed */}
      <div className="col-span-12 lg:col-span-6 glass-panel rounded-3xl p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Bolt className="w-5 h-5 text-secondary" />
          <h3 className="text-xl font-bold tracking-tight">
            Motivation Stream
          </h3>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {logs.map((log, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className={`flex gap-4 p-4 rounded-2xl border-l-2 ${
                log.type === "roast"
                  ? "bg-error/5 border-error"
                  : log.type === "motivation"
                    ? "bg-secondary/5 border-secondary"
                    : "bg-primary/5 border-primary"
              }`}
            >
              <span
                className={`font-bold text-xs shrink-0 ${
                  log.type === "roast"
                    ? "text-error"
                    : log.type === "motivation"
                      ? "text-secondary"
                      : "text-primary"
                }`}
              >
                {log.time}
              </span>
              <p
                className={`text-sm ${log.type === "roast" ? "opacity-90" : ""}`}
              >
                {log.msg}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
          <div className="flex-1 h-12 bg-surface-container/30 rounded-2xl border border-white/5 flex items-center px-6">
            <span className="text-xs text-on-surface-variant/40 italic">
              Interface with Aether...
            </span>
          </div>
          <button className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
