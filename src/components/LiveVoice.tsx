import React, { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface LiveVoiceProps {
  isOpen: boolean;
  onClose: () => void;
  voiceName: string;
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ isOpen, onClose, voiceName }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [transcription, setTranscription] = useState("");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      sessionRef.current = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          systemInstruction: "You are Wisdom AI, in a live voice conversation. Be concise and helpful. Maintain your hacker/teacher persona. Use Google Search for every query.",
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Int16Array(binaryString.length / 2);
                  for (let i = 0; i < bytes.length; i++) {
                    bytes[i] = (binaryString.charCodeAt(i * 2) & 0xFF) | (binaryString.charCodeAt(i * 2 + 1) << 8);
                  }
                  audioQueue.current.push(bytes);
                  if (!isPlaying.current) playNextChunk();
                }
              }
            }
            if (message.serverContent?.interrupted) {
              setIsInterrupted(true);
              audioQueue.current = [];
              isPlaying.current = false;
            }
          },
          onclose: () => {
            stopAll();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            stopAll();
          }
        }
      });
    } catch (err) {
      console.error("Failed to connect:", err);
      setIsConnecting(false);
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (!sessionRef.current || isInterrupted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const playNextChunk = async () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const chunk = audioQueue.current.shift()!;
    
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    
    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < chunk.length; i++) {
      data[i] = chunk[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextChunk;
    source.start();
  };

  const stopAll = () => {
    sessionRef.current?.close();
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setIsActive(false);
    setIsConnecting(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !isActive && !isConnecting) {
      startSession();
    }
    return () => {
      if (!isOpen && isActive) stopAll();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-24 right-6 z-50 w-80 bg-zinc-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden"
        >
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-500/5">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Live Session</span>
            </div>
            <button onClick={stopAll} className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className={cn(
                "absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl transition-opacity duration-500",
                isActive ? "opacity-100" : "opacity-0"
              )} />
              <div className={cn(
                "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                isActive ? "border-cyan-500 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "border-zinc-700"
              )}>
                {isConnecting ? (
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                ) : isActive ? (
                  <Volume2 className="w-8 h-8 text-cyan-500 animate-bounce" />
                ) : (
                  <MicOff className="w-8 h-8 text-zinc-600" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isConnecting ? "Establishing Link..." : isActive ? "Link Active" : "Offline"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {isActive ? "AQUA SLOVIC is listening" : "Waiting for connection"}
              </p>
            </div>

            {isActive && (
              <div className="w-full flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-cyan-500/50 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-black/40 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              Secure Neural Link Established
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
