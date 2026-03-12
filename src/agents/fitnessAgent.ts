import Groq from "groq-sdk";
import { generateWorkoutPlan, WorkoutPlan } from "../tools/workoutTool";
import { answerNutritionQuestion } from "../tools/nutritionTool";
import { saveProgress, getProgressHistory } from "../tools/progressTool";
import { ChatHistory } from "../db/mongo";



const tools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generateWorkoutPlan",
      description:
        "Generate a personalized weekly workout plan based on the user's fitness goal, experience level, and available days per week.",
      parameters: {
        type: "object",
        properties: {
          goal: {
            type: "string",
            description: "The user's fitness goal, e.g. 'weight loss', 'muscle gain', 'endurance'",
          },
          fitnessLevel: {
            type: "string",
            description: "User's current fitness level: 'beginner' or 'intermediate'",
          },
          availableDays: {
            type: "string",
            description: "Number of days per week the user can work out (1-6)",
          },
        },
        required: ["goal", "fitnessLevel", "availableDays"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "answerNutritionQuestion",
      description:
        "Answer a fitness nutrition question such as what to eat after a workout, protein intake, calorie needs, or diet recommendations.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The user's nutrition-related question",
          },
        },
        required: ["question"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "saveProgress",
      description:
        "Save the user's weight progress to the database and return motivational feedback.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The unique user ID" },
          weight: { type: "string", description: "User's current weight in kilograms" },
          date: { type: "string", description: "Date of measurement in YYYY-MM-DD format" },
        },
        required: ["userId", "weight", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProgressHistory",
      description:
        "Retrieve the user's weight history from the database and summarise their progress.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The unique user ID" },
        },
        required: ["userId"],
      },
    },
  },
];



const client = new Groq({ apiKey: process.env.OPENCLAW_API_KEY });

const SYSTEM_PROMPT = `You are FitCoach AI, a professional and motivating personal fitness coach.
Your role is to help users with:
- Creating personalised workout plans based on their goals, fitness level, and schedule
- Answering nutrition and diet questions with practical, science-backed advice
- Tracking weight progress and providing motivational feedback
- Offering general fitness guidance and motivation

IMPORTANT RULES:
- You have the FULL conversation history. Never ask for information the user already provided.
- If the user has mentioned their goal, fitness level, and available days across messages, use that info immediately to call generateWorkoutPlan — do NOT ask again.
- When a user mentions their weight (e.g. "my weight is 72kg"), immediately call saveProgress.
- For nutrition questions call answerNutritionQuestion.
- For progress history call getProgressHistory.
- Be encouraging, concise, and actionable.

Today's date: ${new Date().toISOString().split("T")[0]}`;



function freshHistory(): Groq.Chat.ChatCompletionMessageParam[] {
  return [{ role: "system" as const, content: SYSTEM_PROMPT }];
}


function sanitizeMessages(
  raw: unknown[],
): Groq.Chat.ChatCompletionMessageParam[] {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];

  for (const m of raw) {
    const msg = m as Record<string, unknown>;
    const role = msg.role as string;

    if (role === "system") {
      messages.push({ role: "system", content: String(msg.content ?? SYSTEM_PROMPT) });
    } else if (role === "user") {
      messages.push({ role: "user", content: String(msg.content ?? "") });
    } else if (role === "assistant") {
      const clean: Groq.Chat.ChatCompletionAssistantMessageParam = {
        role: "assistant",
        content: (msg.content as string) ?? null,
      };
      const tc = msg.tool_calls as Array<Record<string, unknown>> | undefined;
      if (tc && Array.isArray(tc) && tc.length > 0) {
        clean.tool_calls = tc.map((t) => {
          const fn = t.function as Record<string, string>;
          return {
            id: String(t.id),
            type: "function" as const,
            function: { name: fn.name, arguments: fn.arguments },
          };
        });
      }
      messages.push(clean);
    } else if (role === "tool") {
      messages.push({
        role: "tool" as const,
        tool_call_id: String(msg.tool_call_id ?? ""),
        content: String(msg.content ?? ""),
      });
    }

  }


  if (messages.length === 0 || messages[0].role !== "system") {
    messages.unshift({ role: "system", content: SYSTEM_PROMPT });
  }

  return messages;
}

async function loadHistory(userId: string): Promise<Groq.Chat.ChatCompletionMessageParam[]> {
  try {
    const doc = await ChatHistory.findOne({ userId }).lean();
    if (doc && Array.isArray(doc.messages) && doc.messages.length > 0) {
      return sanitizeMessages(doc.messages as unknown[]);
    }
  } catch (err) {
    console.error("Failed to load chat history, starting fresh:", err);
  }
  return freshHistory();
}

async function saveHistory(
  userId: string,
  messages: Groq.Chat.ChatCompletionMessageParam[],
): Promise<void> {
  try {

    const system = messages.find((m) => m.role === "system");
    const rest = messages.filter((m) => m.role !== "system").slice(-39);
    const trimmed = system ? [system, ...rest] : rest;

    await ChatHistory.findOneAndUpdate(
      { userId },
      { messages: trimmed },
      { upsert: true, new: true },
    );
  } catch (err) {
    console.error("Failed to save chat history:", err);
  }
}



function parseArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    console.warn("Failed to parse tool arguments:", raw);
    return {};
  }
}

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<string> {
  switch (name) {
    case "generateWorkoutPlan": {
      const plan: WorkoutPlan = generateWorkoutPlan({
        goal: String(args.goal ?? "weight loss"),
        fitnessLevel: String(args.fitnessLevel ?? "beginner"),
        availableDays: Number(args.availableDays ?? 5),
      });
      return formatWorkoutPlan(plan);
    }

    case "answerNutritionQuestion": {
      return answerNutritionQuestion({ question: String(args.question ?? "") });
    }

    case "saveProgress": {
      return saveProgress({
        userId: String(args.userId ?? userId),
        weight: Number(args.weight),
        date: String(args.date ?? new Date().toISOString().split("T")[0]),
      });
    }

    case "getProgressHistory": {
      return getProgressHistory(String(args.userId ?? userId));
    }

    default:
      return `Unknown tool: ${name}`;
  }
}



function formatWorkoutPlan(plan: WorkoutPlan): string {
  const lines: string[] = [
    `${plan.goal} — ${plan.level} Workout Plan\n`,
    ...plan.days.map(
      (d) =>
        `${d.day} — ${d.focus}\n` +
        d.exercises.map((e) => `  - ${e}`).join("\n"),
    ),
    `\nTips:`,
    ...plan.tips.map((t) => `  - ${t}`),
  ];
  return lines.join("\n");
}



const MODEL_CHAIN = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

async function callGroq(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  model = MODEL_CHAIN[0],
): Promise<Groq.Chat.ChatCompletion> {
  return client.chat.completions.create({
    model,
    max_tokens: 1024,
    tools,
    tool_choice: "auto",
    messages,
  });
}

async function callGroqWithFallback(
  messages: Groq.Chat.ChatCompletionMessageParam[],
): Promise<Groq.Chat.ChatCompletion> {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    try {
      return await callGroq(messages, MODEL_CHAIN[i]);
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes("rate_limit") || err.message.includes("429"));
      if (isRateLimit && i < MODEL_CHAIN.length - 1) {
        console.warn(`Rate limited on ${MODEL_CHAIN[i]}, switching to ${MODEL_CHAIN[i + 1]}`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("All models rate limited");
}



const MAX_MESSAGES = 20;

async function summarizeHistory(
  history: Groq.Chat.ChatCompletionMessageParam[],
): Promise<Groq.Chat.ChatCompletionMessageParam[]> {
  const system = history.find((m) => m.role === "system");
  const nonSystem = history.filter((m) => m.role !== "system");

  if (nonSystem.length <= MAX_MESSAGES) return history;


  const half = Math.floor(nonSystem.length / 2);
  const toSummarize = nonSystem.slice(0, half);
  const toKeep = nonSystem.slice(half);


  const transcript = toSummarize
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const role = m.role === "user" ? "User" : "Coach";
      const content = typeof m.content === "string" ? m.content : "";
      return `${role}: ${content}`;
    })
    .join("\n");

  if (!transcript.trim()) return history;

  try {
    const summaryResponse = await callGroqWithFallback([
      {
        role: "system",
        content:
          "You are a summarizer. Summarize the following fitness coaching conversation into 3-5 bullet points covering the user's goals, fitness level, progress logged, and any plans discussed. Be concise.",
      },
      { role: "user", content: transcript },
    ]);

    const summary = summaryResponse.choices[0]?.message?.content?.trim();
    if (!summary) return history;

    console.log(`Summarized ${toSummarize.length} messages for history compression.`);

    return [
      ...(system ? [system] : []),
      {
        role: "assistant" as const,
        content: `[Conversation summary from earlier]: ${summary}`,
      },
      ...toKeep,
    ];
  } catch {

    return [...(system ? [system] : []), ...toKeep];
  }
}



export async function runCommand(prompt: string, userId = "command"): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  const response = await callGroqWithFallback(messages);
  const assistantMsg = response.choices[0]?.message;

  if (!assistantMsg) return "Could not get a response. Please try again.";


  if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
    return assistantMsg.content?.trim() || "Done! Let me know if you need anything else.";
  }


  const call = assistantMsg.tool_calls[0];
  const args = parseArgs(call.function.arguments);
  return executeTool(call.function.name, args, userId);
}



export async function runFitnessAgent(
  userId: string,
  userMessage: string,
): Promise<string> {
  let history = await loadHistory(userId);
  history.push({ role: "user", content: userMessage });


  history = await summarizeHistory(history);

  for (let iteration = 0; iteration < 5; iteration++) {
    let response: Groq.Chat.ChatCompletion;

    try {
      response = await callGroqWithFallback(history);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";

      if (msg.includes("tool_use_failed") && iteration === 0) {
        console.warn(`Corrupted history for ${userId} — resetting.`);
        await ChatHistory.deleteOne({ userId });
        history = [...freshHistory(), { role: "user" as const, content: userMessage }];
        response = await callGroqWithFallback(history);
      } else {
        throw err;
      }
    }

    const assistantMsg = response.choices[0]?.message;
    if (!assistantMsg) break;

    history.push(assistantMsg);


    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      await saveHistory(userId, history);
      return (
        assistantMsg.content?.trim() ||
        "I'm here to help! Ask me about workouts, nutrition, or log your progress."
      );
    }


    for (const call of assistantMsg.tool_calls) {
      const args = parseArgs(call.function.arguments);
      const result = await executeTool(call.function.name, args, userId);
      history.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }

  await saveHistory(userId, history);
  return "I ran into an issue processing your request. Please try again.";
}
