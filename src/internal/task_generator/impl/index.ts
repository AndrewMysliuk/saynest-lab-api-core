import { Types } from "mongoose"

import { ITaskGenerator } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, IGenericTaskEntity, ITaskGeneratorRequest, TaskTypeEnum } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { ICommunicationReviewService } from "../../communication_review"
import { IPromptService } from "../../prompts_library"
import { IRepository } from "../storage"
import { TaskTypeMap, getTaskDefinition } from "./helpers"
import { buildSystemPrompt } from "./prompt"

const log = createScopedLogger("TaskGeneratorService")

export class TaskGeneratorService implements ITaskGenerator {
  private readonly taskGeneratorRepo: IRepository
  private readonly communicationReviewService: ICommunicationReviewService
  private readonly promptService: IPromptService

  constructor(taskGeneratorRepo: IRepository, communicationReviewService: ICommunicationReviewService, promptService: IPromptService) {
    this.taskGeneratorRepo = taskGeneratorRepo
    this.communicationReviewService = communicationReviewService
    this.promptService = promptService
  }

  async generateTask<T extends TaskTypeEnum>(request: ITaskGeneratorRequest & { type: T }): Promise<IGenericTaskEntity<TaskTypeMap[T]["response_type"]>> {
    try {
      const review = await this.communicationReviewService.getReview(request.review_id, request.user_id)
      const prompt = await this.promptService.getScenario(review.prompt_id)

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      const systemPrompt = buildSystemPrompt(request, prompt)
      const userPrompt = "Start Task Generation"

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]

      const { schema, parseResponse } = getTaskDefinition(request.type)

      const response = await openaiREST.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.6,
        max_tokens: 800,
        // max_completion_tokens: 800,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: schema,
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "structured_response_tool" },
        },
      })

      const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
      const choice = response.choices?.[0]

      if (!choice) throw new Error("no choices")

      if (choice.finish_reason === "length") {
        throw new Error("OpenAI response was cut off due to max_tokens limit.")
      }

      if (!toolCall || !("function" in toolCall)) {
        throw new Error("no function tool call in response.")
      }

      const rawParsed = JSON.parse(toolCall.function.arguments)
      const formattedData = parseResponse(rawParsed)

      const saved = await this.taskGeneratorRepo.create({
        _id: new Types.ObjectId(),
        type: request.type,
        mode: request.mode,
        topic_title: request.topic_title,
        target_language: request.target_language,
        explanation_language: request.explanation_language,
        task: formattedData,
        is_completed: false,
        review_id: new Types.ObjectId(request.review_id),
        user_id: new Types.ObjectId(request.user_id),
        organization_id: new Types.ObjectId(request.organization_id),
        created_at: new Date(),
        updated_at: new Date(),
      })

      return saved
    } catch (error: unknown) {
      log.error("generateTask", "error", { error })
      throw error
    }
  }

  async setCompleted(task_id: string, answers: Record<number, string>): Promise<IGenericTaskEntity> {
    try {
      const entity = await this.taskGeneratorRepo.setCompleted(new Types.ObjectId(task_id), answers)

      if (!entity) {
        throw new Error("nullable entity")
      }

      return entity
    } catch (error: unknown) {
      log.error("setCompleted", "error", { error })
      throw error
    }
  }

  async listByReviewId(user_id: string, review_id: string): Promise<IGenericTaskEntity[]> {
    try {
      return await this.taskGeneratorRepo.listByReviewId(new Types.ObjectId(user_id), new Types.ObjectId(review_id))
    } catch (error: unknown) {
      log.error("listByReviewId", "error", { error })
      throw error
    }
  }

  async getById(task_id: string): Promise<IGenericTaskEntity | null> {
    try {
      return this.taskGeneratorRepo.getById(new Types.ObjectId(task_id))
    } catch (error: unknown) {
      log.error("getById", "error", { error })
      throw error
    }
  }
}
