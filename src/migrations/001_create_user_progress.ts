import { UserModel } from "../internal/user/storage/mongo/model"
import { UserProgressModel } from "../internal/user_progress/storage/mongo/model"
import { logger } from "../utils"

export async function runMigration(): Promise<void> {
  const users = await UserModel.find({})
  logger.info(`Found ${users.length} users`)

  let created = 0

  for (const user of users) {
    const exists = await UserProgressModel.findOne({ user_id: user._id })

    if (!exists) {
      await UserProgressModel.create({
        user_id: user._id,
        organization_id: user.organization_id,
        total_sessions: 0,
        avg_session_duration: 0,
        total_session_duration: 0,
        cefr_history: [],
        error_stats: [],
        filler_words_usage: [],
        completed_prompts: {},
        tasks: [],
        current_day_streak: 0,
        longest_day_streak: 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      created++
    }
  }

  logger.info(`Created ${created} user_progress entries`)
}
