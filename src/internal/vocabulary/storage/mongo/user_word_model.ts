import mongoose, { Document, Schema } from "mongoose"

import { IUserWord, IUserWordTierEnum } from "../../../../types"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"
import { MODEL_NAME as GLOBAL_WORD_TABLE } from "./global_word_model"

export const MODEL_NAME = "user_words"
export type IUserWordDocument = IUserWord & Document

const UserWordSchema = new Schema<IUserWordDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, ref: USER_TABLE },
    global_word_id: { type: Schema.Types.ObjectId, required: true, ref: GLOBAL_WORD_TABLE },
    tier: { type: Number, enum: IUserWordTierEnum, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

UserWordSchema.index({ user_id: 1, global_word_id: 1 }, { unique: true })

export const UserWordModel = mongoose.model<IUserWordDocument>(MODEL_NAME, UserWordSchema)
