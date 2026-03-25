/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Chat } from "./components/Chat";
import { Settings } from "./components/Settings";
import { VoiceInterface } from "./components/VoiceInterface";
import { LiveVoice } from "./components/LiveVoice";
import { Message, AppSettings } from "./types";
import { generateAIResponse, transcribeAudio } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { Send, Settings as SettingsIcon, Zap, Shield, BookOpen, Terminal, Phone, Mail, ExternalLink, Activity, Paperclip, X as CloseIcon } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    model: "fast",
    voice: "Zephyr",
    accentColor: "#06b6d4",
    isLiveMode: false,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text: string = input, file: typeof attachment = attachment) => {
    if (!text.trim() && !file) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
      attachment: file || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachment(null);
    setIsTyping(true);

    try {
      const responseText = await generateAIResponse([...messages, userMsg], settings);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "System error. Connection to AQUA SLOVIC lost. Please retry.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceNote = async (blob: Blob) => {
    setIsTyping(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const transcription = await transcribeAudio(base64);
        if (transcription) {
          handleSend(transcription);
        }
      };
    } catch (error) {
      console.error("Voice Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        name: file.name,
      });
    };
  };

  return (
    <div 
      className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-cyan-500/30"
      style={{ "--accent": settings.accentColor } as React.CSSProperties}
    >
      {/* Background Grid/Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <img 
              src="/logo.jpeg" 
              alt="Logo" 
              className="relative w-10 h-10 rounded-full border border-cyan-500/50 object-cover bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/aqua/100/100";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              AQUA SLOVIC
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
              <span className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-cyan-500" />
              Ethical Hacking
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-cyan-500" />
              Coding
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-cyan-500" />
              School
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveOpen(!isLiveOpen)}
              className={cn(
                "p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2",
                isLiveOpen 
                  ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                  : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <Activity className={cn("w-5 h-5", isLiveOpen && "animate-pulse")} />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Live Mode</span>
            </button>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all duration-300 group"
            >
              <SettingsIcon className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
              <img 
                src="/logo.jpeg" 
                alt="AQUA SLOVIC" 
                className="w-32 h-32 rounded-full border-2 border-cyan-500/30 shadow-2xl relative z-10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://picsum.photos/seed/aqua/200/200";
                }}
              />
            </motion.div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-3xl font-black tracking-tight text-white uppercase">Aqua Slovic AI Ready</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Welcome to AQUA SLOVIC AI. I am here to provide intelligent assistance and support. How may I help you today?
              </p>
            </div>
          </div>
        ) : (
          <Chat messages={messages} isTyping={isTyping} />
        )}

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {attachment && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-2 bg-zinc-900 border border-cyan-500/30 rounded-xl w-fit"
              >
                {attachment.mimeType.startsWith("image/") ? (
                  <img src={`data:${attachment.mimeType};base64,${attachment.data}`} className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 bg-cyan-500/10 rounded flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-cyan-500" />
                  </div>
                )}
                <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[150px]">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="p-1 hover:bg-white/5 rounded-full">
                  <CloseIcon className="w-3 h-3 text-zinc-500" />
                </button>
              </motion.div>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500" />
                <div className="relative bg-zinc-900 border border-white/10 rounded-2xl flex items-end p-2 focus-within:border-cyan-500/50 transition-all">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,text/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="p-3 text-zinc-500 hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="write message"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-200 placeholder:text-zinc-600 resize-none py-3 px-4 max-h-40 min-h-[48px] custom-scrollbar"
                    rows={1}
                  />
                  <div className="flex items-center gap-2 p-1">
                    <VoiceInterface 
                      onVoiceNote={handleVoiceNote} 
                      isProcessing={isTyping}
                      accentColor={settings.accentColor}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={(!input.trim() && !attachment) || isTyping}
                      className="p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-900/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links / Footer */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <a href="https://wisdom-malata.vercel.app" target="_blank" className="hover:text-cyan-500 flex items-center gap-1.5 transition-colors">
              <ExternalLink className="w-3 h-3" />
              Portfolio
            </a>
            <span className="opacity-20">|</span>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              +265992393452
            </div>
            <span className="opacity-20">|</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              AquaSlovic@gmail.com
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
      />

      <LiveVoice 
        isOpen={isLiveOpen} 
        onClose={() => setIsLiveOpen(false)} 
        voiceName={settings.voice}
      />

      {/* Global Styles for Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
