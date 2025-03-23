import { IVocabularyEntity } from "../../../types"

export interface IRepository {
  list(user_id: string): Promise<IVocabularyEntity[]>
  getByUserId(user_id: string, word: string): Promise<IVocabularyEntity | null>
  getBySessionId(session_id: string, word: string): Promise<IVocabularyEntity | null>
  set(data: Partial<IVocabularyEntity>): Promise<IVocabularyEntity>
}
