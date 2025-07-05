import { ScenarioModel } from "../internal/prompts_library/storage/mongo/scenarios_model"
import { IModelBehavior, IPromptMeta } from "../types"
import { logger } from "../utils"

export async function runMigration(): Promise<void> {
  const scenarios = await ScenarioModel.find({
    $or: [{ "meta.is_it_ielts": { $exists: false } }, { "model_behavior.ielts_scenario": { $exists: false } }, { "model_behavior.scenario": { $exists: false } }],
  })

  logger.info(`Found ${scenarios.length} scenarios with missing IELTS fields`)

  let updated = 0

  for (const scenario of scenarios) {
    if (!scenario.meta) {
      scenario.meta = {} as IPromptMeta
    }

    if (scenario.meta.is_it_ielts === undefined) {
      scenario.meta.is_it_ielts = false
    }

    if (!scenario.model_behavior) {
      scenario.model_behavior = {} as IModelBehavior
    }

    if (scenario.model_behavior.ielts_scenario === undefined) {
      scenario.model_behavior.ielts_scenario = null
    }

    if (scenario.model_behavior.scenario === undefined) {
      scenario.model_behavior.scenario = null
    }

    await scenario.save()
    updated++
  }

  logger.info(`Updated ${updated} scenarios`)
}
