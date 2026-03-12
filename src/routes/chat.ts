import { Router, Request, Response } from "express";
import { runFitnessAgent } from "../agents/fitnessAgent";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message } = req.body as { userId?: string; message?: string };

    if (!userId || !message) {
      res.status(400).json({ error: "userId and message are required" });
      return;
    }

    const reply = await runFitnessAgent(userId, message);
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Agent error. Please try again." });
  }
});

export default router;
