import { GoogleGenAI } from "@google/genai";

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[Gemini SDK] Initialization error:", err);
    return null;
  }
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-3.6-flash";
}

export function getGeminiStatus(): {
  geminiConfigured: boolean;
  configuredModel: string;
  sdkInitialized: boolean;
} {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key_here");
  const client = getGeminiClient();

  return {
    geminiConfigured: isConfigured,
    configuredModel: getGeminiModel(),
    sdkInitialized: client !== null,
  };
}
