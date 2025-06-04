import { IMongooseOptions, ISearchSynonymsRequest, IVocabularyEntity, IVocabularyFillersEntity, IVocabularyJSONEntity, IWordExplanationRequest } from "../../types"

export interface IVocabularyTracker {
  getWordExplanation(user_id: string, organization_id: string, dto: IWordExplanationRequest): Promise<IVocabularyJSONEntity>
  getWordAudio(dto: IWordExplanationRequest): Promise<string>
  wordsList(): Promise<IVocabularyEntity[]>
  wordsListBySessionId(session_id: string): Promise<IVocabularyEntity[]>
  searchFillersByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyFillersEntity[]>
  deleteAllBySessionId(session_id: string): Promise<void>
  deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void>
}
