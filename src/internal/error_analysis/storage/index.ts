import { Types } from "mongoose"

import { IErrorAnalysisEntity, IErrorAnalysisModelEntity, IMongooseOptions } from "../../../types"

export interface IRepository {
  setErrorAnalysis(
    session_id: string,
    prompt_id: string,
    last_user_message: string,
    dto: IErrorAnalysisModelEntity,
    organization_id: Types.ObjectId | undefined,
    user_id: Types.ObjectId | undefined,
    options?: IMongooseOptions,
  ): Promise<IErrorAnalysisEntity | null>
  getErrorAnalysisById(id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity | null>
  listErrorAnalysisBySession(session_id: string, options?: IMongooseOptions): Promise<IErrorAnalysisEntity[]>
  deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void>
}
