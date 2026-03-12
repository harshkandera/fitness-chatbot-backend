import { Router, Request, Response } from "express";
import { saveProgress, getProgressHistory } from "../tools/progressTool";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, weight, date } = req.body as {
      userId?: string;
      weight?: number;
      date?: string;
    };

    if (!userId || weight === undefined) {
      res.status(400).json({ error: "userId and weight are required" });
      return;
    }

    const entryDate = date ?? new Date().toISOString().split("T")[0];
    const message = await saveProgress({ userId, weight, date: entryDate });
    res.json({ message });
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const history = await getProgressHistory(userId);
    res.json({ history });
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

export default router;
