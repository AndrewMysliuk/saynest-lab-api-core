import { ISearchSynonymsRequest, IVocabularyEntity, IWordExplanationRequest } from "../../types"

export interface IVocabularyTracker {
  getWordExplanation(dto: IWordExplanationRequest): Promise<IVocabularyEntity>
  getWordAudio(dto: IWordExplanationRequest): Promise<string>
  wordsList(): Promise<IVocabularyEntity[]>
  searchSynonymsByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyEntity[]>
}
