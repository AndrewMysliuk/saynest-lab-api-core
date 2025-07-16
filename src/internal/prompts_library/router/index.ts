import { Router } from "express"

import { IPromptService } from ".."
import { superUserOnlyMiddleware } from "../../../middlewares"
import {
  createModuleHandler,
  createScenarioHandler,
  getModuleHandler,
  getModuleScenariosHandler,
  getScenarioHandler,
  listIeltsScenariosHandler,
  listModulesHandler,
  listScenariosHandler,
  updateModuleHandler,
  updateScenarioHandler,
} from "../handlers"

export const createPromptRouter = (promptService: IPromptService): Router => {
  const router = Router()

  // Scenarios
  router.post("/scenario", superUserOnlyMiddleware, createScenarioHandler(promptService))
  router.put("/scenario/:id", superUserOnlyMiddleware, updateScenarioHandler(promptService))
  router.get("/scenario/:id", getScenarioHandler(promptService))
  router.get("/scenarios", listScenariosHandler(promptService))
  router.get("/ielts-scenarios", listIeltsScenariosHandler(promptService))

  // Modules
  router.post("/module", superUserOnlyMiddleware, createModuleHandler(promptService))
  router.put("/module/:id", superUserOnlyMiddleware, updateModuleHandler(promptService))
  router.get("/module/:id", getModuleHandler(promptService))
  router.get("/modules", listModulesHandler(promptService))
  router.get("/module/:id/scenarios", getModuleScenariosHandler(promptService))

  return router
}
