import React, { useRef, useEffect } from "react";
import { Message } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface ChatProps {
  messages: Message[];
  isTyping: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, isTyping }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-hide"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex w-full max-w-3xl mx-auto",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "relative p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300",
                msg.role === "user"
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-50"
                  : "bg-cyan-900/20 border-cyan-500/30 text-cyan-50"
              )}
            >
              {msg.role === "model" && (
                <div className="absolute -top-3 -left-2 bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AQUA SLOVIC
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.attachment && (
                <div className="mt-3 p-2 bg-black/20 rounded-lg border border-white/10 flex items-center gap-3">
                  {msg.attachment.mimeType.startsWith("image/") ? (
                    <img 
                      src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                      alt={msg.attachment.name}
                      className="w-16 h-16 object-cover rounded-md border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-cyan-500/20 rounded flex items-center justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-tighter">FILE</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-zinc-300">{msg.attachment.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{msg.attachment.mimeType}</p>
                  </div>
                </div>
              )}
              <div className="mt-2 text-[10px] opacity-40 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start max-w-3xl mx-auto"
        >
          <div className="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-2xl flex space-x-2 items-center">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </motion.div>
      )}
    </div>
  );
};
