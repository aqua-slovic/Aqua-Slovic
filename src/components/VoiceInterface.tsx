import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Loader2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface VoiceInterfaceProps {
  onVoiceNote: (blob: Blob) => void;
  isProcessing: boolean;
  accentColor: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceNote,
  isProcessing,
  accentColor,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        onVoiceNote(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerInterval.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-4">
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 font-mono text-sm">{formatTime(recordingTime)}</span>
            <button
              onClick={stopRecording}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={startRecording}
            disabled={isProcessing}
            className={cn(
              "p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 disabled:opacity-50",
              "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-cyan-500 hover:text-cyan-400"
            )}
            style={{ borderColor: isProcessing ? undefined : accentColor }}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
