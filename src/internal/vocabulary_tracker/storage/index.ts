import { IMongooseOptions, IVocabularyEntity, IWordExplanationRequest } from "../../../types"

export interface IRepository {
  list(options?: IMongooseOptions): Promise<IVocabularyEntity[]>
  listBySessionId(session_id: string, options?: IMongooseOptions): Promise<IVocabularyEntity[] | null>
  getByWord(dto: IWordExplanationRequest, options?: IMongooseOptions): Promise<IVocabularyEntity | null>
  create(data: Partial<IVocabularyEntity>, options?: IMongooseOptions): Promise<IVocabularyEntity>
  patchAudio(id: string, audio_base64: string | null, options?: IMongooseOptions): Promise<IVocabularyEntity>
  delete(id: string, options?: IMongooseOptions): Promise<void>
}
