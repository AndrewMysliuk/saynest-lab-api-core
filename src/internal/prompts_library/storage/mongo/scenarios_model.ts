import mongoose, { Document, Schema } from "mongoose"

import {
  IIELTSPartOneAndThree,
  IIELTSPartTwo,
  IIELTSScenarioDetails,
  IIELTSTopic,
  IModelBehavior,
  IPromptMeta,
  IPromptQuestionCountRange,
  IPromptScenarioEntity,
  IScenarioDetails,
  IUserContent,
  VocabularyFrequencyLevelEnum,
} from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "scenarios"

export type IScenarioDocument = IPromptScenarioEntity & Document

const UserContentSchema = new Schema<IUserContent>(
  {
    goals: [
      {
        phrase: { type: String, required: true },
        translation: { type: Map, of: String },
      },
    ],
    dictionary: [
      {
        word: { type: String, required: true },
        translation: { type: Map, of: String },
        meaning: { type: String, required: true },
      },
    ],
    phrases: [
      {
        phrase: { type: String, required: true },
        translation: { type: Map, of: String },
        meaning: { type: String, required: true },
      },
    ],
  },
  { _id: false },
)

const ScenarioDetailsSchema = new Schema<IScenarioDetails>(
  {
    setting: { type: String, required: true },
    situation: { type: String, required: true },
    goal: { type: String, required: true },
    steps: [{ type: String, required: true }],
    optional_steps: [{ type: String, required: true }],
  },
  { _id: false },
)

const IELTSTopicSchema = new Schema<IIELTSTopic>(
  {
    title: { type: String, required: true },
    questions: [{ type: String, required: true }],
  },
  { _id: false },
)

const IELTSPartOneAndThreeSchema = new Schema<IIELTSPartOneAndThree>(
  {
    topics: { type: [IELTSTopicSchema], required: true },
  },
  { _id: false },
)

const IELTSPartTwoSchema = new Schema<IIELTSPartTwo>(
  {
    title: { type: String, required: true },
    question: { type: String, required: true },
    bullet_points: [{ type: String, required: true }],
  },
  { _id: false },
)

const IELTSScenarioDetailsSchema = new Schema<IIELTSScenarioDetails>(
  {
    setting: { type: String, required: true },
    part1: { type: IELTSPartOneAndThreeSchema, required: true },
    part2: { type: IELTSPartTwoSchema, required: true },
    part3: { type: IELTSPartOneAndThreeSchema, required: true },
  },
  { _id: false },
)

const ModelBehaviorSchema = new Schema<IModelBehavior>(
  {
    prompt: { type: String, required: true },
    scenario: { type: ScenarioDetailsSchema, default: null },
    ielts_scenario: { type: IELTSScenarioDetailsSchema, default: null },
  },
  { _id: false },
)

const QuestionCountRangeSchema = new Schema<IPromptQuestionCountRange>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false },
)

const PromptMetaSchema = new Schema<IPromptMeta>(
  {
    estimated_duration_minutes: { type: Number, required: true },
    max_turns: { type: Number, required: true },
    model_end_behavior: { type: String, required: true },
    target_language: { type: String, required: true },
    question_count_range: { type: QuestionCountRangeSchema, default: null },
    is_it_ielts: { type: Boolean, default: false },
  },
  { _id: false },
)

const ScenarioSchema = new Schema<IScenarioDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    name: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    user_content: { type: UserContentSchema, required: true },
    model_behavior: { type: ModelBehaviorSchema, required: true },
    meta: { type: PromptMetaSchema, required: true },
    is_module_only: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const ScenarioModel = mongoose.model<IScenarioDocument>(MODEL_NAME, ScenarioSchema)
