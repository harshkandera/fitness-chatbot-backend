import TelegramBot from "node-telegram-bot-api";
import { runFitnessAgent, runCommand } from "../agents/fitnessAgent";

let bot: TelegramBot | null = null;

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .trim();
}

async function sendSafe(chatId: number, text: string): Promise<void> {
  const clean = stripMarkdown(text).trim() || "I'm here to help!";
  await bot!.sendMessage(chatId, clean);
}

async function handleCommand(
  chatId: number,
  prompt: string,
  typingMsg?: string
): Promise<void> {
  if (typingMsg) await bot!.sendMessage(chatId, typingMsg);
  const reply = await runCommand(prompt);
  await sendSafe(chatId, reply);
}

export function startTelegramBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
    return;
  }

  bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot started (polling)");

  bot.setMyCommands([
    { command: "start",     description: "Welcome message and guide" },
    { command: "workout",   description: "Get a personalised workout plan" },
    { command: "nutrition", description: "Get nutrition advice" },
    { command: "progress",  description: "View your weight progress history" },
  ]).catch((err) => console.error("Failed to set bot commands:", err));

  const cmd = (name: string) => new RegExp(`^\\/${name}(@\\w+)?$`);

  bot.onText(cmd("start"), (msg) => {
    const chatId = msg.chat.id;
    bot!.sendMessage(
      chatId,
      "Welcome to Fitness Coach AI — your personal trainer.\n\n" +
        "What I can do:\n" +
        "  Generate personalised workout plans\n" +
        "  Answer nutrition questions\n" +
        "  Track your weight progress\n\n" +
        "Commands:\n" +
        "/workout  Get a workout plan\n" +
        "/nutrition  Nutrition advice\n" +
        "/progress  View your progress\n\n" +
        "Or just type your question naturally."
    );
  });

  bot.onText(cmd("workout"), (msg) => {
    const chatId = msg.chat.id;
    handleCommand(
      chatId,
      "Give me a beginner workout plan for weight loss with 5 days per week",
      "Generating your workout plan..."
    ).catch((err) => {
      console.error("Telegram /workout error:", err);
      bot!.sendMessage(chatId, "Could not generate a workout plan. Please try again.");
    });
  });

  bot.onText(cmd("nutrition"), (msg) => {
    const chatId = msg.chat.id;
    handleCommand(
      chatId,
      "Give me general fitness nutrition advice and tips",
      "Fetching nutrition advice..."
    ).catch((err) => {
      console.error("Telegram /nutrition error:", err);
      bot!.sendMessage(chatId, "Could not fetch nutrition advice. Please try again.");
    });
  });

  bot.onText(cmd("progress"), (msg) => {
    const chatId = msg.chat.id;
    const userId = String(msg.from?.id ?? chatId);
    runCommand("Show me my weight progress history", userId)
      .then((reply) => sendSafe(chatId, reply))
      .catch((err) => {
        console.error("Telegram /progress error:", err);
        bot!.sendMessage(chatId, "Could not fetch progress. Please try again.");
      });
  });

  bot.on("message", (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const chatId = msg.chat.id;
    const userId = String(msg.from?.id ?? chatId);

    bot!.sendChatAction(chatId, "typing");

    runFitnessAgent(userId, msg.text)
      .then((reply) => sendSafe(chatId, reply))
      .catch((err) => {
        console.error("Telegram message error:", err);
        bot!.sendMessage(chatId, "Sorry, I ran into an issue. Please try again.");
      });
  });

  bot.on("polling_error", (err) => {
    console.error("Telegram polling error:", err.message);
  });
}
