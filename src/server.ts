import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/mongo";
import chatRouter from "./routes/chat";
import progressRouter from "./routes/progress";
import { startTelegramBot } from "./telegram/bot";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "https://fitness-chatbot-frontend.vercel.app/",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "fitness-coach-api" });
});

app.use("/api/chat", chatRouter);
app.use("/api/progress", progressRouter);

async function bootstrap(): Promise<void> {
  await connectDB();
  startTelegramBot();

  app.listen(PORT, () => {
    console.log(`\n🚀 Fitness Coach API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Chat:         POST http://localhost:${PORT}/api/chat`);
    console.log(
      `   Progress:     GET/POST http://localhost:${PORT}/api/progress\n`,
    );
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
