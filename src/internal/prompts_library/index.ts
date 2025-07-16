import { IIeltsPromptFilters, IModuleFilters, IModuleScenarioEntity, IMongooseOptions, IPagination, IPromptFilters, IPromptScenarioEntity } from "../../types"

export interface IPromptService {
  createScenario(dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity>
  updateScenario(id: string, dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity>
  getScenario(id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity>
  listScenario(filter?: IPromptFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]>
  listIeltsScenario(filter?: IIeltsPromptFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]>

  createModule(dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity>
  updateModule(id: string, dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity>
  getModule(id: string, options?: IMongooseOptions): Promise<IModuleScenarioEntity>
  listModule(filter?: IModuleFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IModuleScenarioEntity[]>

  getScenariosForModule(module_id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]>
}
