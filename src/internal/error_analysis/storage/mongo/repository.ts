import { IErrorAnalysisEntity, IErrorAnalysisModelEntity } from "../../../../types"
import { IRepository } from "../index"
import { ErrorAnalysisModel } from "./model"

export class ErrorAnalysisRepository implements IRepository {
  async setErrorAnalysis(session_id: string, message: string, dto: IErrorAnalysisModelEntity): Promise<IErrorAnalysisEntity | null> {
    if (!dto.has_errors) return null

    const record = await ErrorAnalysisModel.create({
      session_id,
      message,
      issues: dto.issues,
      summary_comment: dto.summary_comment,
      has_errors: dto.has_errors,
    })

    return record
  }

  async getErrorAnalysisById(id: string): Promise<IErrorAnalysisEntity | null> {
    return ErrorAnalysisModel.findById(id).lean()
  }

  async listErrorAnalysisBySession(session_id: string): Promise<IErrorAnalysisEntity[]> {
    return ErrorAnalysisModel.find({ session_id }).sort({ created_at: 1 }).lean()
  }
}
