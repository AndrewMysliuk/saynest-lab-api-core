import { IErrorAnalysisEntity, IErrorAnalysisModelEntity, IMongooseOptions } from "../../../../types"
import { IRepository } from "../index"
import { ErrorAnalysisModel } from "./model"

export class ErrorAnalysisRepository implements IRepository {
  async setErrorAnalysis(session_id: string, last_user_message: string, dto: IErrorAnalysisModelEntity, options?: IMongooseOptions): Promise<IErrorAnalysisEntity | null> {
    if (!dto.has_errors) return null

    const record = new ErrorAnalysisModel({
      session_id,
      last_user_message,
      suggestion_message: dto.suggestion_message,
      detected_language: dto.detected_language,
      is_target_language: dto.is_target_language,
      discussion_topic: dto.discussion_topic,
      sentence_structure: dto.sentence_structure,
      issues: dto.issues,
      has_errors: dto.has_errors,
    })

    await record.save({ session: options?.session })

    return record
  }

  async getErrorAnalysisById(id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity | null> {
    return ErrorAnalysisModel.findById(id)
      .lean()
      .session(options?.session || null)
  }

  async listErrorAnalysisBySession(session_id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity[]> {
    return ErrorAnalysisModel.find({ session_id })
      .sort({ created_at: 1 })
      .lean()
      .session(options?.session || null)
  }
}
