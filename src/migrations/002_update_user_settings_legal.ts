import { UserModel } from "../internal/user/storage/mongo/model"
import { IUserSettings } from "../types"
import { logger } from "../utils"

export async function runMigration(): Promise<void> {
  const users = await UserModel.find({
    $or: [{ "settings.is_accept_terms_and_conditions": { $exists: false } }, { "settings.is_accept_privacy_policy": { $exists: false } }, { "settings.is_accept_refund_policy": { $exists: false } }],
  })

  logger.info(`Found ${users.length} users with missing settings`)

  let updated = 0

  for (const user of users) {
    const settings = user.settings || ({} as IUserSettings)

    if (settings.is_accept_terms_and_conditions === undefined) {
      settings.is_accept_terms_and_conditions = false
    }

    if (settings.is_accept_privacy_policy === undefined) {
      settings.is_accept_privacy_policy = false
    }

    if (settings.is_accept_refund_policy === undefined) {
      settings.is_accept_refund_policy = false
    }

    user.settings = settings
    await user.save()
    updated++
  }

  logger.info(`Updated ${updated} users with missing settings fields`)
}
