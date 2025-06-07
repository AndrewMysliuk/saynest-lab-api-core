import { IPromptService } from ".."
import { createScopedLogger } from "../../..//utils"
import { IModuleFilters, IModuleScenarioEntity, IMongooseOptions, IPagination, IPromptFilters, IPromptScenarioEntity } from "../../../types"
import { IRepository } from "../storage"

const log = createScopedLogger("PromptService")

export class PromptService implements IPromptService {
  private readonly promptRepo: IRepository

  constructor(promptRepo: IRepository) {
    this.promptRepo = promptRepo
  }

  async createScenario(dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      return this.promptRepo.createScenario(dto, options)
    } catch (error: unknown) {
      log.error("createScenario", "error", { error })
      throw error
    }
  }

  async updateScenario(id: string, dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      return this.promptRepo.updateScenario(id, dto, options)
    } catch (error: unknown) {
      log.error("updateScenario", "error", { error })
      throw error
    }
  }

  async getScenario(id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      return this.promptRepo.getScenario(id, options)
    } catch (error: unknown) {
      log.error("getScenario", "error", { error })
      throw error
    }
  }

  async listScenario(filter?: IPromptFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]> {
    try {
      return this.promptRepo.listScenario(filter, pagination, options)
    } catch (error: unknown) {
      log.error("listScenario", "error", { error })
      throw error
    }
  }

  async createModule(dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      return this.promptRepo.createModule(dto, options)
    } catch (error: unknown) {
      log.error("createModule", "error", { error })
      throw error
    }
  }

  async updateModule(id: string, dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      return this.promptRepo.updateModule(id, dto, options)
    } catch (error: unknown) {
      log.error("updateModule", "error", { error })
      throw error
    }
  }

  async getModule(id: string, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      return this.promptRepo.getModule(id, options)
    } catch (error: unknown) {
      log.error("getModule", "error", { error })
      throw error
    }
  }

  async listModule(filter?: IModuleFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IModuleScenarioEntity[]> {
    try {
      return this.promptRepo.listModule(filter, pagination, options)
    } catch (error: unknown) {
      log.error("listModule", "error", { error })
      throw error
    }
  }

  async getScenariosForModule(module_id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]> {
    try {
      return this.promptRepo.getScenariosForModule(module_id, options)
    } catch (error: unknown) {
      log.error("getScenariosForModule", "error", { error })
      throw error
    }
  }
}
