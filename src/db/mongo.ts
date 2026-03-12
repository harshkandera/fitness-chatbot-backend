import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in environment");

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

const userProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    weight: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    messages: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
