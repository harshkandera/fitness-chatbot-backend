import { UserProgress } from "../db/mongo";

export interface SaveProgressInput {
  userId: string;
  weight: number;
  date: string;
}

export interface ProgressEntry {
  weight: number;
  date: string;
  createdAt: Date;
}

export async function saveProgress(input: SaveProgressInput): Promise<string> {
  const { userId, weight, date } = input;

  const previous = await UserProgress.findOne({ userId }).sort({ createdAt: -1 });

  await UserProgress.create({ userId, weight, date });

  if (!previous) {
    return `Progress saved! ✅ Your starting weight is recorded as **${weight}kg** on ${date}. Keep going!`;
  }

  const diff = (previous.weight - weight).toFixed(1);
  const diffNum = parseFloat(diff);

  if (diffNum > 0) {
    return `Progress saved! ✅ Previous weight: **${previous.weight}kg** → Current: **${weight}kg**. You lost **${diff}kg** — great work! Keep it up! 💪`;
  } else if (diffNum < 0) {
    return `Progress saved! ✅ Previous weight: **${previous.weight}kg** → Current: **${weight}kg**. You gained **${Math.abs(diffNum)}kg**. If bulking, that's progress! If cutting, stay consistent with your diet. 💪`;
  } else {
    return `Progress saved! ✅ Weight unchanged at **${weight}kg**. Stay consistent — results take time! 💪`;
  }
}

export async function getProgressHistory(userId: string): Promise<string> {
  const entries = await UserProgress.find({ userId }).sort({ createdAt: 1 }).lean();

  if (entries.length === 0) {
    return "No progress entries found. Start logging your weight with: *'My weight today is Xkg'*";
  }

  const lines = entries.map((e, i) => `${i + 1}. ${e.date} — **${e.weight}kg**`);

  const first = entries[0];
  const last = entries[entries.length - 1];
  const totalChange = (last.weight - first.weight).toFixed(1);
  const changeLabel = parseFloat(totalChange) < 0 ? `Lost ${Math.abs(parseFloat(totalChange))}kg` : parseFloat(totalChange) > 0 ? `Gained ${totalChange}kg` : "No change";

  return (
    `**Weight History for User ${userId}:**\n\n` +
    lines.join("\n") +
    `\n\n📊 **Summary:** ${changeLabel} since ${first.date} (${entries.length} entries logged)`
  );
}
