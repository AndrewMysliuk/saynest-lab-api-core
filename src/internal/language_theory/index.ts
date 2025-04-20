import { ILanguageTopic, VocabularyFrequencyLevelEnum } from "../../types"

export interface ILanguageTheory {
  list(): Promise<ILanguageTopic[]>
  listByLanguage(language: string): Promise<ILanguageTopic[]>
  filteredShortListByLanguage(language: string, filters: { topic_ids?: string[]; topic_titles?: string[]; level_cefr?: VocabularyFrequencyLevelEnum[] }): Promise<ILanguageTopic[]>
}
