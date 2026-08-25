import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { processRouter } from "./routes/process.js";
import { gradeRouter } from "./routes/grade.js";
import { getGeminiStatus } from "./services/gemini/gemini.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health Check with safe Gemini status diagnostics
app.get("/api/health", (_req, res) => {
  const geminiInfo = getGeminiStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: geminiInfo.geminiConfigured,
    configuredModel: geminiInfo.configuredModel,
    sdkInitialized: geminiInfo.sdkInitialized,
  });
});

// API Routes
app.use("/api", processRouter);
app.use("/api", gradeRouter);

app.listen(PORT, () => {
  console.log(`🚀 AI Assessment Mapper backend listening on http://localhost:${PORT}`);
});
