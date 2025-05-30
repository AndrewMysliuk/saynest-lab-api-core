import mongoose, { Document, Schema, Types } from "mongoose"

import { IModuleScenarioEntity, IModuleSubmodules, ModuleTypeEnum, VocabularyFrequencyLevelEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"
import { MODEL_NAME as SCENARIOS_TABLE } from "./scenarios_model"

export const MODEL_NAME = "modules"

export type IModuleDocument = IModuleScenarioEntity & Document

const SubmoduleSchema = new Schema<IModuleSubmodules>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tips: [{ type: String, required: true }],
    tags: [{ type: String }],
    difficulty: { type: String },
    scenarios: [{ type: Types.ObjectId, ref: SCENARIOS_TABLE, required: true }],
  },
  { _id: false },
)

const ModuleSchema = new Schema<IModuleDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    name: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: [String], enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    tags: [{ type: String, required: true }],
    type: { type: String, enum: Object.values(ModuleTypeEnum), required: true },
    scenarios: [{ type: Types.ObjectId, ref: SCENARIOS_TABLE, required: true }],
    submodules: { type: [SubmoduleSchema], default: [] },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const ModuleModel = mongoose.model<IModuleDocument>(MODEL_NAME, ModuleSchema)
