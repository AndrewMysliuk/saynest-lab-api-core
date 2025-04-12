import { IErrorAnalysisEntity, IErrorAnalysisModelEntity, IMongooseOptions } from "../../../../types"
import { IRepository } from "../index"
import { ErrorAnalysisModel } from "./model"

export class ErrorAnalysisRepository implements IRepository {
  async setErrorAnalysis(session_id: string, message: string, dto: IErrorAnalysisModelEntity, options?: IMongooseOptions): Promise<IErrorAnalysisEntity | null> {
    if (!dto.has_errors) return null

    const record = new ErrorAnalysisModel({
      session_id,
      message,
      issues: dto.issues,
      summary_comment: dto.summary_comment,
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
