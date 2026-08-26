import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { processRouter } from "./routes/process.js";
import { gradeRouter } from "./routes/grade.js";
import { assessmentRouter } from "./routes/assessment.js";
import { getGeminiStatus } from "./services/gemini/gemini.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for local and production hosts
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));
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
app.use("/api", assessmentRouter);

// Static Client Asset Serving for Production Deployment (Express 5 SPA Fallback)
const clientDistPath = path.resolve(process.cwd(), "dist");
const indexPath = path.join(clientDistPath, "index.html");

if (fs.existsSync(clientDistPath) && fs.existsSync(indexPath)) {
  console.log(`[Production] Serving static client bundle from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) {
          console.error("Error serving index.html:", err);
          res.status(500).send("Error loading client application");
        }
      });
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🚀 AI Assessment Mapper backend listening on http://localhost:${PORT}`);
});
