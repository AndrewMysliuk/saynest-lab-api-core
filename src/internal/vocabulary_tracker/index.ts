import { ISearchSynonymsRequest, IVocabularyJSONEntry, IWordExplanationRequest } from "../../types"

export interface IVocabularyTracker {
  getWordExplanation(dto: IWordExplanationRequest): Promise<IVocabularyJSONEntry>
  getWordAudio(dto: IWordExplanationRequest): Promise<string>
  wordsList(): Promise<IVocabularyJSONEntry[]>
  searchSynonymsByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyJSONEntry[]>
}
