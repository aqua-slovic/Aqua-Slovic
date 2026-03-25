import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings as SettingsIcon, User, Globe, Palette, Cpu, Volume2 } from "lucide-react";
import { AppSettings, ModelType } from "../types";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
}) => {
  const voices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-500/5">
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                SYSTEM CONFIG
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyan-500/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Model Selection */}
              <section className="space-y-3">
                <label className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-3 h-3" />
                  Processing Core
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["fast", "pro"] as ModelType[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateSettings({ model: m })}
                      className={`py-3 px-4 rounded-xl border transition-all duration-300 capitalize font-medium ${
                        settings.model === m
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-cyan-500/50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>

              {/* Voice Selection */}
              <section className="space-y-3">
                <label className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest flex items-center gap-2">
                  <Volume2 className="w-3 h-3" />
                  Voice Synthesis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {voices.map((v) => (
                    <button
                      key={v}
                      onClick={() => updateSettings({ voice: v })}
                      className={`py-2 px-3 rounded-lg border text-sm transition-all duration-300 ${
                        settings.voice === v
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-cyan-500/30"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </section>

              {/* Appearance */}
              <section className="space-y-3">
                <label className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Visual Interface
                </label>
                <div className="flex gap-3">
                  {["#06b6d4", "#8b5cf6", "#ec4899", "#10b981"].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateSettings({ accentColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        settings.accentColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </section>

              {/* About */}
              <section className="pt-6 border-t border-cyan-500/10 space-y-4 text-zinc-400 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Creator</p>
                    <p className="font-medium text-zinc-200">Wisdom Malata</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Portfolio</p>
                    <a
                      href="https://wisdom-malata.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-400 hover:underline"
                    >
                      wisdom-malata.vercel.app
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
