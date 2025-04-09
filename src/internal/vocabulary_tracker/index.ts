import { ISearchSynonymsRequest, IVocabularyEntity, IVocabularyJSONEntity, IWordExplanationRequest } from "../../types"

export interface IVocabularyTracker {
  getWordExplanation(dto: IWordExplanationRequest): Promise<IVocabularyJSONEntity>
  getWordAudio(dto: IWordExplanationRequest): Promise<string>
  wordsList(): Promise<IVocabularyEntity[]>
  searchSynonymsByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyJSONEntity[]>
}
