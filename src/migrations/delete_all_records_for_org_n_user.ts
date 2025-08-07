import { Types } from "mongoose"

import { cleanUserSessionFiles, connectToDatabase, deleteUserFiles, disconnectFromDatabase } from "../config"
import { RefreshTokenModel } from "../internal/auth/storage/mongo/model"
import { StatisticsModel } from "../internal/communication_review/storage/mongo/model"
import { ConversationHistoryModel } from "../internal/conversation/storage/mongo/model"
import { ErrorAnalysisModel } from "../internal/error_analysis/storage/mongo/model"
import { OrganizationModel } from "../internal/organisation/storage/mongo/model"
import { ModuleModel } from "../internal/prompts_library/storage/mongo/modules_model"
import { ScenarioModel } from "../internal/prompts_library/storage/mongo/scenarios_model"
import { SessionModel } from "../internal/session/storage/mongo/model"
import { SubscriptionModel } from "../internal/subscription/storage/mongo/model"
import { TaskModel } from "../internal/task_generator/storage/mongo/model"
import { UserModel } from "../internal/user/storage/mongo/model"
import { UserProgressModel } from "../internal/user_progress/storage/mongo/model"
import { UserWordModel } from "../internal/vocabulary/storage/mongo/user_word_model"
import { logger } from "../utils"

const USER_ID = "685e6e9405c9b12cd244b4ec"
const ORG_ID = "685e6e9405c9b12cd244b4ea"
const userObjectId = new Types.ObjectId(USER_ID)
const orgObjectId = new Types.ObjectId(ORG_ID)

async function main() {
  try {
    await connectToDatabase()

    // Find sessions related to the user
    const userSessions = await SessionModel.find({
      user_id: userObjectId,
      organization_id: orgObjectId,
    })

    const sessionIds = userSessions.map((s) => ({
      _id: s._id.toString(),
      user_id: s.user_id?.toString(),
      organization_id: s.organization_id?.toString(),
    }))

    // HAS USER_ID ONLY
    await UserWordModel.deleteMany({ user_id: userObjectId })

    // HAS ORG_ID ONLY
    await OrganizationModel.deleteOne({ _id: orgObjectId })
    await SubscriptionModel.deleteMany({ organization_id: orgObjectId })

    // HAS BOTH IDS
    await RefreshTokenModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await StatisticsModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await ConversationHistoryModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await ErrorAnalysisModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await ModuleModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await ScenarioModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await SessionModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await TaskModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })
    await UserProgressModel.deleteMany({ user_id: userObjectId, organization_id: orgObjectId })

    // Delete the user document itself
    await UserModel.deleteOne({ _id: userObjectId })

    // Delete GCS files related to the user root folder
    const { filesDeleted: userFiles } = await deleteUserFiles(ORG_ID, USER_ID)
    logger.info(`Deleted user root files: ${userFiles}`)

    // Delete session-related GCS files
    if (sessionIds.length) {
      const { filesDeleted: sessionFiles } = await cleanUserSessionFiles(sessionIds)
      logger.info(`Deleted session files: ${sessionFiles}`)
    }

    logger.info("Workflow completed")
  } catch (error) {
    logger.error(`Workflow failed: ${error}`)
  } finally {
    await disconnectFromDatabase()
  }
}

main()
