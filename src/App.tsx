import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Timer,
  BarChart3,
  Settings as SettingsIcon,
  Bolt,
  Bell,
  UserCircle,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppProvider } from "./contexts/AppContext";
import Dashboard from "./components/Dashboard";
import FocusView from "./components/FocusView";
import Sessions from "./components/Sessions";
import SettingsPage from "./components/Settings";

type View = "dashboard" | "focus" | "sessions" | "settings";

function AppContent() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  useEffect(() => {
    const handleNavigate = () => setCurrentView("focus");
    window.addEventListener("navigate-to-focus", handleNavigate);
    return () =>
      window.removeEventListener("navigate-to-focus", handleNavigate);
  }, []);

  const views = {
    dashboard: <Dashboard />,
    focus: <FocusView />,
    sessions: <Sessions />,
    settings: <SettingsPage />,
  };

  return (
    <div className="flex min-h-screen bg-[#131313] text-[#e5e2e1] font-sans selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 border-r border-white/10 bg-surface/60 backdrop-blur-3xl z-50 flex flex-col">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-bold tracking-tighter text-primary cobalt-glow uppercase">
            Neural Core
          </h1>
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] mt-1 font-medium">
            Elite Performance
          </p>
        </div>

        <nav className="flex-1 mt-10 space-y-2 px-4">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "sessions", icon: Timer, label: "Sessions" },
            { id: "settings", icon: SettingsIcon, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                currentView === item.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${currentView === item.id ? "scale-110" : "group-hover:scale-110"} transition-transform`}
              />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-8">
          <button
            onClick={() => setCurrentView("focus")}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:active-glow hover:scale-[1.02] active:scale-95 transition-all ${
              currentView === "focus"
                ? "bg-primary text-[#1d00a5]"
                : "bg-primary-container text-white"
            }`}
          >
            <Bolt className="w-4 h-4" />
            <span className="hidden md:block">Focus Mode</span>
          </button>

          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=131313`}
                alt="Profile"
                className="w-full h-full grayscale"
              />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold">Alex Mercer</p>
              <p className="text-[10px] text-on-surface-variant">
                L7 Architect
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-12 py-8 flex justify-between items-center bg-transparent">
          <div>
            <h2 className="text-2xl font-bold text-primary cobalt-glow uppercase tracking-wider">
              Aether AI
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container-high/40 rounded-full px-4 py-2 border border-white/5 focus-within:inner-glow-border transition-all">
              <input
                type="text"
                placeholder="Search telemetry..."
                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-on-surface-variant/40"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-white/5">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-white/5">
                <UserCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="px-12 pb-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {views[currentView]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Quick Action FAB */}
      <button className="fixed bottom-12 right-12 w-14 h-14 bg-primary text-[#1d00a5] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 cobalt-glow">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
