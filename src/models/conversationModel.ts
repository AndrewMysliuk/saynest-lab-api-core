import mongoose, { Document, Schema } from "mongoose"

export interface IConversationHistory extends Document {
  sessionId: string
  pairId: string
  role: "system" | "user" | "assistant"
  content: string
  audioUrl?: string
  createdAt: Date
}

const conversationHistorySchema = new Schema<IConversationHistory>({
  sessionId: { type: String, required: true },
  pairId: { type: String, required: true },
  role: { type: String, enum: ["system", "user", "assistant"], required: true },
  content: { type: String, required: true },
  audioUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const ConversationHistoryModel = mongoose.model<IConversationHistory>("ConversationHistory", conversationHistorySchema)
