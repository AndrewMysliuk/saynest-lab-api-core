import { IMongooseOptions, IPagination, IUserWordListFilters, IUserWordLookUpRequest, IUserWordPublic, IUserWordTierEnum } from "../../types"

export interface IVocabulary {
  lookupWord(dto: IUserWordLookUpRequest, options?: IMongooseOptions): Promise<IUserWordPublic | null>
  generateWordAudioUrl(global_word_id: string, options?: IMongooseOptions): Promise<string>
  addWordToUser(user_id: string, global_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic>
  updateUserWordTier(user_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic>
  deleteUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<void>
  listUserWords(user_id: string, filters: IUserWordListFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IUserWordPublic[]>
}
