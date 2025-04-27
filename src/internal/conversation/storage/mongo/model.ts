import mongoose, { Document, Schema } from "mongoose"

import { IConversationHistory } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "conversation_histories"

export type IConversationHistoryDocument = IConversationHistory & Document

const conversationHistorySchema = new Schema<IConversationHistoryDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: false, default: null },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: false, default: null },
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
