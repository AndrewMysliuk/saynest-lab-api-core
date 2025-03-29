import { Router } from "express"

import { IScenarioSimulationService } from ".."
import { startSimulationHandler } from "../handlers"

export const createScenarioSimulationRouter = (scenarioSimulationService: IScenarioSimulationService): Router => {
  const router = Router()

  router.post("/", startSimulationHandler(scenarioSimulationService))

  return router
}
