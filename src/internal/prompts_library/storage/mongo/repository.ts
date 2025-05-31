import { Types } from "mongoose"

import { IRepository } from ".."
import { IModuleFilters, IModuleScenarioEntity, IMongooseOptions, IPagination, IPromptFilters, IPromptScenarioEntity } from "../../../../types"
import { logger } from "../../../../utils"
import { ModuleModel } from "./modules_model"
import { ScenarioModel } from "./scenarios_model"

export class PromptsLibraryRepository implements IRepository {
  async createScenario(dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const created = await ScenarioModel.create([{ ...dto }], options)

      return created[0].toObject()
    } catch (error: unknown) {
      logger.error(`createScenario | error: ${error}`)
      throw error
    }
  }

  async updateScenario(id: string, dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const updated = await ScenarioModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })

      if (!updated) throw new Error(`Scenario not found: ${id}`)

      return updated.toObject()
    } catch (error: unknown) {
      logger.error(`updateScenario | error: ${error}`)
      throw error
    }
  }

  async getScenario(id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const scenario = await ScenarioModel.findById(new Types.ObjectId(id), {}, options)

      if (!scenario) throw new Error(`Scenario not found: ${id}`)

      return scenario.toObject({ flattenMaps: true })
    } catch (error: unknown) {
      logger.error(`getScenario | error: ${error}`)
      throw error
    }
  }

  async listScenario(filter?: IPromptFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]> {
    try {
      const query: any = {}

      if (filter?.title) {
        query.title = { $regex: new RegExp(filter.title, "i") }
      }

      if (filter?.is_module_only !== undefined) {
        query.is_module_only = filter.is_module_only
      }

      if (filter?.organization_id) {
        query.organization_id = new Types.ObjectId(filter.organization_id)
      }

      if (filter?.user_id) {
        query.user_id = new Types.ObjectId(filter.user_id)
      }

      const scenarios = await ScenarioModel.find(query, {}, options)
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 20)

      return scenarios.map((s) => s.toObject({ flattenMaps: true }))
    } catch (error: unknown) {
      logger.error(`listScenario | error: ${error}`)
      throw error
    }
  }

  async createModule(dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const created = await ModuleModel.create([{ ...dto }], options)

      return created[0].toObject()
    } catch (error: unknown) {
      logger.error(`createModule | error: ${error}`)
      throw error
    }
  }

  async updateModule(id: string, dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const updated = await ModuleModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })

      if (!updated) throw new Error(`Module not found: ${id}`)

      return updated.toObject()
    } catch (error: unknown) {
      logger.error(`updateModule | error: ${error}`)
      throw error
    }
  }

  async getModule(id: string, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const module = await ModuleModel.findById(new Types.ObjectId(id), {}, options)

      if (!module) throw new Error(`Module not found: ${id}`)

      return module.toObject({ flattenMaps: true })
    } catch (error: unknown) {
      logger.error(`getModule | error: ${error}`)
      throw error
    }
  }

  async listModule(filter?: IModuleFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IModuleScenarioEntity[]> {
    try {
      const query: any = {}

      if (filter?.title) {
        query.title = { $regex: new RegExp(filter.title, "i") }
      }

      if (filter?.organization_id) {
        query.organization_id = new Types.ObjectId(filter.organization_id)
      }

      if (filter?.user_id) {
        query.user_id = new Types.ObjectId(filter.user_id)
      }

      const modules = await ModuleModel.find(query, {}, options)
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 20)

      return modules.map((m) => m.toObject({ flattenMaps: true }))
    } catch (error: unknown) {
      logger.error(`listModule | error: ${error}`)
      throw error
    }
  }

  async getScenariosForModule(module_id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity[]> {
    try {
      const module = await ModuleModel.findById(new Types.ObjectId(module_id), {}, options)

      if (!module) {
        throw new Error(`Module not found: ${module_id}`)
      }

      const scenarioIds = module.scenarios

      const scenarios = await ScenarioModel.find({ _id: { $in: scenarioIds } }, {}, options)

      return scenarios.map((s) => s.toObject({ flattenMaps: true }))
    } catch (error: unknown) {
      logger.error(`getScenariosForModule | error: ${error}`)
      throw error
    }
  }
}
