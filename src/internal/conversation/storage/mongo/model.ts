import mongoose, { Document, Schema } from "mongoose"

import { IConversationHistory } from "../../../../types"

export const TABLE_NAME = "conversation_histories"

export type IConversationHistoryDocument = IConversationHistory & Document

const conversationHistorySchema = new Schema<IConversationHistoryDocument>({
  session_id: { type: String, required: true },
  pair_id: { type: String, required: true },
  role: { type: String, enum: ["system", "user", "assistant"], required: true },
  content: { type: String, required: true },
  audio_url: { type: String },
  created_at: { type: Date, default: Date.now },
})

export const ConversationHistoryModel = mongoose.model<IConversationHistoryDocument>(TABLE_NAME, conversationHistorySchema)
