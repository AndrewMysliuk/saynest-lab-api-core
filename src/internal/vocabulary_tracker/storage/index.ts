import { IVocabularyEntity, IWordExplanationRequest } from "../../../types"

export interface IRepository {
  list(): Promise<IVocabularyEntity[]>
  getBySessionId(session_id: string): Promise<IVocabularyEntity[] | null>
  getByWord(dto: IWordExplanationRequest): Promise<IVocabularyEntity | null>
  create(data: Partial<IVocabularyEntity>): Promise<IVocabularyEntity>
  patchAudio(id: string, audio_base64: string | null): Promise<IVocabularyEntity>
  delete(id: string): Promise<void>
}
