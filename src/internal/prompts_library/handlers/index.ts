import { Request, RequestHandler, Response } from "express"

import { Types } from "mongoose"

import { IPromptService } from ".."
import { IModuleFilters, IPromptFilters } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { CreateModuleSchema, CreateScenarioSchema, UpdateModuleSchema, UpdateScenarioSchema } from "./validation"

const log = createScopedLogger("PromptHandler")

export const createScenarioHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateScenarioSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const user_id = new Types.ObjectId(req.user!.user_id)
      const organization_id = new Types.ObjectId(req.user!.organization_id)

      const cleanedData = {
        ...parsed.data,
        user_id,
        organization_id,
        model_behavior: {
          ...parsed.data.model_behavior,
          scenario: parsed.data.model_behavior.scenario ?? null,
          ielts_scenario: parsed.data.model_behavior.ielts_scenario ?? null,
        },
      }

      const scenario = await promptService.createScenario(cleanedData)

      res.status(201).json(scenario)
    } catch (error: unknown) {
      log.error("createScenarioHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const updateScenarioHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid scenario id" })
        return
      }

      const parsed = UpdateScenarioSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const user_id = new Types.ObjectId(req.user!.user_id)
      const organization_id = new Types.ObjectId(req.user!.organization_id)

      const updated = await promptService.updateScenario(id, { ...parsed.data, user_id, organization_id })
      res.status(200).json(updated)
    } catch (error: unknown) {
      log.error("updateScenarioHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getScenarioHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid scenario id" })
        return
      }

      const scenario = await promptService.getScenario(id)

      if (!scenario) {
        res.status(404).json({ error: "Scenario not found" })
        return
      }

      res.status(200).json(scenario)
    } catch (error: unknown) {
      log.error("getScenarioHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const listScenariosHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, title, is_module_only, limit = 20, offset = 0, user_id, organization_id } = req.query

      const filter: IPromptFilters = {
        title: title as string,
        is_module_only: is_module_only === "true",
        search: search as string,
      }

      if (user_id) {
        filter.user_id = user_id as string
      }

      if (organization_id) {
        filter.organization_id = organization_id as string
      }

      const scenarios = await promptService.listScenario(filter, { limit: Number(limit), offset: Number(offset) })

      res.status(200).json(scenarios)
    } catch (error: unknown) {
      log.error("listScenariosHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const createModuleHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateModuleSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const user_id = new Types.ObjectId(req.user!.user_id)
      const organization_id = new Types.ObjectId(req.user!.organization_id)

      const module = await promptService.createModule({ ...parsed.data, user_id, organization_id })

      res.status(201).json(module)
    } catch (error: unknown) {
      log.error("createModuleHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const updateModuleHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid module id" })
        return
      }

      const parsed = UpdateModuleSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const user_id = new Types.ObjectId(req.user!.user_id)
      const organization_id = new Types.ObjectId(req.user!.organization_id)

      const updated = await promptService.updateModule(id, { ...parsed.data, user_id, organization_id })

      res.status(200).json(updated)
    } catch (error: unknown) {
      log.error("updateModuleHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getModuleHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid module id" })
        return
      }

      const module = await promptService.getModule(id)
      if (!module) {
        res.status(404).json({ error: "Module not found" })
        return
      }

      res.status(200).json(module)
    } catch (error: unknown) {
      log.error("getModuleHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const listModulesHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, title, limit = 20, offset = 0, user_id, organization_id } = req.query

      const filter: IModuleFilters = {
        title: title as string,
        search: search as string,
      }

      if (user_id) {
        filter.user_id = user_id as string
      }

      if (organization_id) {
        filter.organization_id = organization_id as string
      }

      const modules = await promptService.listModule(filter, { limit: Number(limit), offset: Number(offset) })

      res.status(200).json(modules)
    } catch (error: unknown) {
      log.error("listModulesHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getModuleScenariosHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid module id" })
        return
      }

      const scenarios = await promptService.getScenariosForModule(id)

      res.status(200).json(scenarios)
    } catch (error: unknown) {
      log.error("getModuleScenariosHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
