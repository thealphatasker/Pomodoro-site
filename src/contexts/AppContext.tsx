import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  status: "pending" | "completed";
}

export interface Session {
  id: string;
  date: string;
  duration: number;
  focusScore: number;
  distractions: number;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  isStrict: boolean;
  personality: "supportive" | "strict" | "roast";
}

interface AppContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  sessions: Session[];
  addSession: (session: Omit<Session, "id">) => void;
  settings: PomodoroSettings;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  weeklyScores: { day: string; score: number }[];
  updateWeeklyScore: (day: string, score: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    title: "Refactor neural architecture",
    subtitle: "Module 4 • Critical",
    status: "pending",
  },
  {
    id: "2",
    title: "Review focus telemetry",
    subtitle: "Diagnostics • Unified",
    status: "completed",
  },
  {
    id: "3",
    title: "Draft protocol summary",
    subtitle: "Documentation • Essential",
    status: "pending",
  },
];

const DEFAULT_WEEKLY_SCORES = [
  { day: "MON", score: 72 },
  { day: "TUE", score: 84 },
  { day: "WED", score: 78 },
  { day: "THU", score: 92 },
  { day: "FRI", score: 86 },
  { day: "SAT", score: 88 },
  { day: "SUN", score: 64 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("neural-core-tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("neural-core-sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem("neural-core-settings");
    return saved
      ? JSON.parse(saved)
      : {
          workMinutes: 25,
          breakMinutes: 5,
          isStrict: true,
          personality: "strict",
        };
  });

  const [weeklyScores, setWeeklyScores] = useState(() => {
    const saved = localStorage.getItem("neural-core-weekly-scores");
    return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCORES;
  });

  useEffect(() => {
    localStorage.setItem("neural-core-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("neural-core-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("neural-core-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(
      "neural-core-weekly-scores",
      JSON.stringify(weeklyScores),
    );
  }, [weeklyScores]);

  const addTask = (task: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString() }]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
            }
          : task,
      ),
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addSession = (session: Omit<Session, "id">) => {
    setSessions((prev) => [...prev, { ...session, id: Date.now().toString() }]);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateWeeklyScore = (day: string, score: number) => {
    setWeeklyScores((prev) =>
      prev.map((item) => (item.day === day ? { ...item, score } : item)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        removeTask,
        sessions,
        addSession,
        settings,
        updateSettings,
        weeklyScores,
        updateWeeklyScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
