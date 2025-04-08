import mongoose, { Document, Schema } from "mongoose"

import { IConversationHistory } from "../../../../types"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"

export const MODEL_NAME = "conversation_histories"

export type IConversationHistoryDocument = IConversationHistory & Document

const conversationHistorySchema = new Schema<IConversationHistoryDocument>(
  {
    session_id: { type: Schema.Types.ObjectId, required: true, ref: SESSION_TABLE },
    pair_id: { type: String, required: true },
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    content: { type: String, required: true },
    audio_url: { type: String },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const ConversationHistoryModel = mongoose.model<IConversationHistoryDocument>(MODEL_NAME, conversationHistorySchema)
