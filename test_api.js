import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-3.6-flash"
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await ai.models.generateContent({
        model: model,
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      });
      console.log(`SUCCESS [${model}]:`, res.text);
      break;
    } catch (e) {
      console.error(`FAILED [${model}]:`, e?.status || e?.message || e);
    }
  }
}
