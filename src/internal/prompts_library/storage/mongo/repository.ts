import { Types } from "mongoose"

import { IRepository } from ".."
import { IModuleFilters, IModuleScenarioEntity, IMongooseOptions, IPagination, IPromptFilters, IPromptScenarioEntity } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { ModuleModel } from "./modules_model"
import { ScenarioModel } from "./scenarios_model"

const log = createScopedLogger("PromptsLibraryRepository")

export class PromptsLibraryRepository implements IRepository {
  async createScenario(dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const created = await ScenarioModel.create([{ ...dto }], options)

      return created[0].toObject()
    } catch (error: unknown) {
      log.error("createScenario", "error", { error })
      throw error
    }
  }

  async updateScenario(id: string, dto: Partial<IPromptScenarioEntity>, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const updated = await ScenarioModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })

      if (!updated) throw new Error(`Scenario not found: ${id}`)

      return updated.toObject()
    } catch (error: unknown) {
      log.error("updateScenario", "error", { error })
      throw error
    }
  }

  async getScenario(id: string, options?: IMongooseOptions): Promise<IPromptScenarioEntity> {
    try {
      const scenario = await ScenarioModel.findById(new Types.ObjectId(id), {}, options)

      if (!scenario) throw new Error(`Scenario not found: ${id}`)

      return scenario.toObject({ flattenMaps: true })
    } catch (error: unknown) {
      log.error("getScenario", "error", { error })
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

      if (filter?.target_language) {
        query["meta.target_language"] = filter.target_language
      }

      if (filter?.search) {
        const regex = new RegExp(filter.search, "i")
        query.$or = [{ title: { $regex: regex } }, { "meta.target_language": { $regex: regex } }]
      }

      const scenarios = await ScenarioModel.find(query, {}, options)
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 20)

      return scenarios.map((s) => s.toObject({ flattenMaps: true }))
    } catch (error: unknown) {
      log.error("listScenario", "error", { error })
      throw error
    }
  }

  async createModule(dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const created = await ModuleModel.create([{ ...dto }], options)

      return created[0].toObject()
    } catch (error: unknown) {
      log.error("createModule", "error", { error })
      throw error
    }
  }

  async updateModule(id: string, dto: Partial<IModuleScenarioEntity>, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const updated = await ModuleModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })

      if (!updated) throw new Error(`Module not found: ${id}`)

      return updated.toObject()
    } catch (error: unknown) {
      log.error("updateModule", "error", { error })
      throw error
    }
  }

  async getModule(id: string, options?: IMongooseOptions): Promise<IModuleScenarioEntity> {
    try {
      const module = await ModuleModel.findById(new Types.ObjectId(id), {}, options)

      if (!module) throw new Error(`Module not found: ${id}`)

      return module.toObject({ flattenMaps: true })
    } catch (error: unknown) {
      log.error("getModule", "error", { error })
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

      if (filter?.tag) {
        query.tags = { $in: [filter.tag] }
      }

      const modules = await ModuleModel.find(query, {}, options)
        .populate({
          path: "scenarios",
          select: "meta.target_language",
        })
        .sort({ created_at: 1 })
        .skip(pagination?.offset ?? 0)
        .limit(pagination?.limit ?? 20)

      const filteredModules = modules.filter((module) => {
        if (filter?.target_language) {
          const hasLang = module.scenarios.some((s: any) => s.meta?.target_language?.toLowerCase() === filter?.target_language?.toLowerCase())
          if (!hasLang) return false
        }

        if (filter?.search) {
          const search = filter.search.toLowerCase()

          const inTitle = module.title.toLowerCase().includes(search)
          const inTags = module.tags.some((t) => t.toLowerCase().includes(search))
          const inLang = module.scenarios.some((s: any) => s.meta?.target_language?.toLowerCase().includes(search))

          if (!inTitle && !inTags && !inLang) return false
        }

        return true
      })

      return filteredModules.map((m) => m.toObject({ flattenMaps: true }))
    } catch (error: unknown) {
      log.error("listModule", "error", { error })
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
      log.error("getScenariosForModule", "error", { error })
      throw error
    }
  }
}
