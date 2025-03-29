import { Request, RequestHandler, Response } from "express"

import { IScenarioSimulationService } from ".."
import logger from "../../../utils/logger"
import { startSimulationRequestSchema } from "./validation"

export const startSimulationHandler = (scenarioSimulationService: IScenarioSimulationService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const result = startSimulationRequestSchema.safeParse(req.body)

      if (!result.success) {
        res.status(400).json({ error: result.error.errors })
        return
      }

      const response = await scenarioSimulationService.startSimulation(result.data)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`languageTheoryHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
