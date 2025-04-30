import { Types } from "mongoose"

import { IErrorAnalysisEntity, IErrorAnalysisModelEntity, IMongooseOptions } from "../../../../types"
import logger from "../../../../utils/logger"
import { IRepository } from "../index"
import { ErrorAnalysisModel } from "./model"

export class ErrorAnalysisRepository implements IRepository {
  async setErrorAnalysis(
    session_id: string,
    prompt_id: string,
    last_user_message: string,
    dto: IErrorAnalysisModelEntity,
    organization_id: Types.ObjectId | undefined,
    user_id: Types.ObjectId | undefined,
    options?: IMongooseOptions,
  ): Promise<IErrorAnalysisEntity | null> {
    try {
      if (!dto.has_errors) return null

      const record = new ErrorAnalysisModel({
        session_id,
        organization_id,
        user_id,
        last_user_message,
        improve_user_answer: dto.improve_user_answer,
        detected_language: dto.detected_language,
        is_target_language: dto.is_target_language,
        prompt_id,
        issues: dto.issues,
        has_errors: dto.has_errors,
        is_end: dto.is_end,
      })

      await record.save({ session: options?.session })

      return record
    } catch (error: unknown) {
      logger.error(`setErrorAnalysis | error: ${error}`)
      throw error
    }
  }

  async getErrorAnalysisById(id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity | null> {
    try {
      return ErrorAnalysisModel.findById(id)
        .lean()
        .session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`getErrorAnalysisById | error: ${error}`)
      throw error
    }
  }

  async listErrorAnalysisBySession(session_id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity[]> {
    try {
      return ErrorAnalysisModel.find({ session_id })
        .sort({ created_at: 1 })
        .lean()
        .session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`listErrorAnalysisBySession | error: ${error}`)
      throw error
    }
  }

  async deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await ErrorAnalysisModel.deleteMany({ session_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteAllBySessionId | error: ${error}`)
      throw error
    }
  }
}
