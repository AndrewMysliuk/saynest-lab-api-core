import { ILanguageTheory } from ".."
import language_theory_bg_json from "../../../json_data/language_theory_bg.json"
import { ILanguageTopic, VocabularyFrequencyLevelEnum } from "../../../types"

export class LanguageTheoryService implements ILanguageTheory {
  async list(): Promise<ILanguageTopic[]> {
    return language_theory_bg_json as ILanguageTopic[]
  }

  async listByLanguage(language: string): Promise<ILanguageTopic[]> {
    const records = language_theory_bg_json as ILanguageTopic[]

    return records.filter((item) => item.language === language)
  }

  async listByLevel(cerf_level: VocabularyFrequencyLevelEnum): Promise<ILanguageTopic[]> {
    const records = language_theory_bg_json as ILanguageTopic[]

    return records.filter((item) => item.cerf_level === cerf_level)
  }

  async getById(id: string): Promise<ILanguageTopic> {
    const records = language_theory_bg_json as ILanguageTopic[]
    const record = records.find((item) => item.id === id)

    if (!record) {
      throw new Error(`record: ${id} not found`)
    }

    return record
  }
}
