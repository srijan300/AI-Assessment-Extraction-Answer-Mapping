import { GoogleGenAI } from "@google/genai";

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[Gemini SDK] Initialization error: Failed to construct client instance.");
    return null;
  }
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function getVisionModel(): string {
  return process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function getFastModel(): string {
  return process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
}

export function getGradingModel(): string {
  return process.env.GEMINI_GRADING_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
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

export async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let attempt = 0;
  let delayMs = 1000;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const status = err?.status || err?.statusCode || 500;
      const isTransient =
        status === 429 ||
        status === 503 ||
        status === 504 ||
        (err?.message &&
          (err.message.includes("RESOURCE_EXHAUSTED") ||
            err.message.includes("DEADLINE_EXCEEDED") ||
            err.message.includes("fetch failed")));

      if (attempt > maxRetries || !isTransient) {
        throw err;
      }

      console.warn(
        `[Gemini Retry] Attempt ${attempt} failed with status ${status}. Retrying in ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }

  throw new Error("Gemini API call failed after retries.");
}
