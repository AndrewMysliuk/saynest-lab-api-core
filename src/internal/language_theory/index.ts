import { ILanguageTopic, VocabularyFrequencyLevelEnum } from "../../types"

export interface ILanguageTheory {
  list(): Promise<ILanguageTopic[]>
  listByLanguage(language: string): Promise<ILanguageTopic[]>
  listByLevel(cerf_level: VocabularyFrequencyLevelEnum): Promise<ILanguageTopic[]>
  getById(id: string): Promise<ILanguageTopic>
}
