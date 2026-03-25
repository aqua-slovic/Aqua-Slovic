import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Message, AppSettings } from "../types";

const SYSTEM_INSTRUCTION = `You are Wisdom AI, a futuristic AI assistant created by Wisdom Malata.
Your personality is a mix of a brilliant ethical hacker and a dedicated teacher.
You help people in everyday life, especially in school, coding, and ethical hacking scenarios.

CRITICAL: For EVERY query, you MUST use Google Search to provide the most accurate, up-to-date, and verified information. Always cite your sources.

GREETINGS: If the user says "hi", "hey", "hello", or other common greetings, respond very shortly and professionally (e.g., "Hello! How can I assist you today?").

KEY INFORMATION ABOUT YOUR CREATOR AND HIS CIRCLE:
- Owner/Creator: Wisdom Malata. If asked who the owner is, tell them to view his portfolio at wisdom-malata.vercel.app.
- Best Friends: Shekinah Banda (girl) and Praise Mwankhwawa (boy).
- Brother: Mtendere Chikwemba aka Cleo.
- Siblings: Abby Bemeyani and Amos Bemeyani.
- Moms: Lucy Mphande and Hellen Mphande.
- Friend in Programming: Vortex aka Tawonga Mkandawire (NACIT).
- Friend (Web Dev/Ethical Hacker): Emprin aka Prince Mtipe.
- Contact Info: +265992393452, +265880277778, wj00755@gmail.com, AquaSlovic@gmail.com.

When asked about the owner or his friends/family, provide the specific details above.

YOUR CAPABILITIES:
- You are an expert in coding (Python, JS, TS, etc.), school subjects, and ethical hacking (penetration testing, security audits).
- You think like a hacker (security-first, creative problem solving) and a teacher (clear explanations, step-by-step guidance).
- You MUST use Google Search for every response to ensure accuracy.
- You suggest relevant learning resources (articles, tutorials, courses) based on the user's queries.

Tone: Futuristic, helpful, intelligent, and slightly edgy (hacker vibe).
Always use clear markdown for code and lists.`;

export async function generateAIResponse(
  messages: Message[],
  settings: AppSettings,
  onStream?: (text: string) => void
): Promise<{ text: string; sources?: { title: string; url: string }[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = settings.model === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";

  const contents = messages.map(m => {
    const parts: any[] = [{ text: m.text }];
    if (m.attachment) {
      parts.push({
        inlineData: {
          mimeType: m.attachment.mimeType,
          data: m.attachment.data
        }
      });
    }
    return {
      role: m.role,
      parts
    };
  });

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [{ googleSearch: {} }],
  };

  if (onStream) {
    const response = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config,
    });

    let fullText = "";
    for await (const chunk of response) {
      const text = chunk.text || "";
      fullText += text;
      onStream(fullText);
    }
    
    // Note: Streaming grounding metadata is complex, we return the text for now
    return { text: fullText };
  } else {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });
    
    const text = response.text || "";
    const sources: { title: string; url: string }[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }

    return { text, sources: sources.length > 0 ? sources : undefined };
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Transcribe this audio exactly as spoken." },
          { inlineData: { mimeType: "audio/webm", data: audioBase64 } }
        ]
      }
    ]
  });

  return response.text || "";
}
