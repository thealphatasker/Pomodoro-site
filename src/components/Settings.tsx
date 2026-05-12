import React from "react";
import { Volume2, User, Palette, Shield, Info, RotateCcw, Save } from "lucide-react";
import { motion } from "motion/react";

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">System Control</h2>
        <p className="text-on-surface-variant font-medium">Configure your elite performance environment and identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          {/* Audio Diagnostics */}
          <section className="glass-panel p-10 rounded-3xl space-y-10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Volume2 className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Audio Diagnostics</h3>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  <span>Voice Feedback Volume</span>
                  <span className="text-primary">85%</span>
                </div>
                <input type="range" className="w-full accent-primary h-1 bg-surface-container-highest rounded-full" defaultValue={85} />
              </div>

              <div className="space-y-6">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Alert Frequency</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-sm">Strict (Real-time)</button>
                  <button className="p-4 rounded-xl border border-white/5 bg-white/5 text-on-surface-variant hover:bg-white/10 transition-all text-sm">Adaptive</button>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Management */}
          <section className="glass-panel p-10 rounded-3xl space-y-10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <User className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Profile Management</h3>
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="group border-b border-surface-variant py-2 focus-within:border-primary transition-all">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Alex Mercer"
                  className="bg-transparent border-none outline-none w-full text-lg font-bold placeholder:opacity-20"
                />
              </div>
              <div className="group border-b border-surface-variant py-2 focus-within:border-primary transition-all">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">System Alias</label>
                <input 
                  type="text" 
                  defaultValue="A_MERCER_01"
                  className="bg-transparent border-none outline-none w-full text-lg font-bold placeholder:opacity-20 uppercase tracking-tighter"
                />
              </div>
              <div className="group border-b border-surface-variant py-2 focus-within:border-primary transition-all">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Primary Directives</label>
                <input 
                  type="text" 
                  defaultValue="Peak cognitive performance, minimal distraction"
                  className="bg-transparent border-none outline-none w-full text-lg font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
               <button className="px-8 py-3 rounded-full border border-white/5 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Discard</button>
               <button className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2">
                 <Save className="w-4 h-4" />
                 Synchronize
               </button>
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
           {/* Interface Settings */}
           <section className="glass-panel p-8 rounded-3xl space-y-8">
              <div className="flex items-center gap-4">
                <Palette className="text-primary w-5 h-5" />
                <h4 className="font-bold">Interface</h4>
              </div>

              <div className="space-y-6">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Ambient Theme</label>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-highest border-2 border-primary text-center space-y-2">
                       <div className="w-8 h-8 rounded-full bg-primary mx-auto opacity-80" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Deep Dark</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-white/10 text-center space-y-2 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer group">
                       <div className="w-8 h-8 rounded-full bg-black mx-auto group-hover:bg-primary transition-all" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-black">Light</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">HUD Transparency</span>
                    <span className="text-primary text-sm font-bold">40%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Neural Glow Strength</span>
                    <div className="flex gap-1.5">
                       <div className="w-4 h-4 rounded-full bg-primary" />
                       <div className="w-4 h-4 rounded-full bg-primary/60" />
                       <div className="w-4 h-4 rounded-full bg-primary/20" />
                    </div>
                 </div>
              </div>
           </section>

           {/* Security / System Identity */}
           <section className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 z-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <Shield className="text-primary w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Security Protocol</span>
                 </div>
                 <p className="text-sm leading-relaxed opacity-80">Last encrypted matrix backup synchronized 14 minutes ago.</p>
                 <button className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest">
                    Renew Access Keys
                 </button>
              </div>
           </section>

           <div className="flex flex-col items-center justify-center py-8 gap-4 opacity-40">
              <div className="w-24 h-24 rounded-full border border-primary/20 p-2 relative">
                 <div className="w-full h-full rounded-full border-2 border-primary flex items-center justify-center">
                    <RotateCcw className="text-primary w-8 h-8" />
                 </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Identity Active</span>
           </div>
        </div>
      </div>
    </div>
  );
}
