import { IErrorAnalysisEntity, IErrorAnalysisModelEntity } from "../../../types"

export interface IRepository {
  setErrorAnalysis(session_id: string, message: string, dto: IErrorAnalysisModelEntity): Promise<IErrorAnalysisEntity | null>
  getErrorAnalysisById(id: string): Promise<IErrorAnalysisEntity | null>
  listErrorAnalysisBySession(session_id: string): Promise<IErrorAnalysisEntity[]>
}
