import { IGlobalWord, IMongooseOptions, IPagination, IUserWordListFilters, IUserWordPublic, IUserWordTierEnum } from "../../../types"

export interface IRepository {
  findByWordAndLangs(word: string, target_language: string, native_language: string, options?: IMongooseOptions): Promise<IGlobalWord | null>
  findById(id: string, options?: IMongooseOptions): Promise<IGlobalWord | null>
  createGlobalWord(data: Partial<IGlobalWord>, options?: IMongooseOptions): Promise<IGlobalWord>
  updateAudioUrlRequest(id: string, audio_url_request: string, options?: IMongooseOptions): Promise<string>

  findUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<IUserWordPublic | null>
  createUserWord(user_id: string, global_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic>
  updateTier(user_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic>
  deleteUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<void>
  listUserWords(user_id: string, filters: IUserWordListFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IUserWordPublic[]>
  getUserWord(user_id: string, options?: IMongooseOptions): Promise<IUserWordPublic | null>
}
