import { IOrganisationService } from ".."
import { IMongooseOptions, IOrganizationEntity, IOrganizationTrialUsage, IOrganizationUpdateRequest } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { IRepository } from "../storage"

const log = createScopedLogger("OrganisationService")

export class OrganisationService implements IOrganisationService {
  private readonly orgRepo: IRepository

  constructor(orgRepo: IRepository) {
    this.orgRepo = orgRepo
  }

  async create(name: string, options?: IMongooseOptions): Promise<IOrganizationEntity> {
    try {
      const organization = await this.orgRepo.create({ name }, options)
      return organization
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async setOwner(id: string, owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity> {
    try {
      const organization = await this.orgRepo.update(id, { owner_id }, options)

      if (!organization) {
        throw new Error(`Organization with id ${id} not found`)
      }

      return organization
    } catch (error: unknown) {
      log.error("setOwner", "error", { error })
      throw error
    }
  }

  async update(id: string, dto: IOrganizationUpdateRequest, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      return this.orgRepo.update(id, dto, options)
    } catch (error: unknown) {
      log.error("update", "error", { error })
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      return this.orgRepo.getById(id, options)
    } catch (error: unknown) {
      log.error("getById", "error", { error })
      throw error
    }
  }

  async updateTrialUsage(id: string, updates: Partial<IOrganizationTrialUsage>, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      return this.orgRepo.updateTrialUsage(id, updates, options)
    } catch (error: unknown) {
      log.error("updateTrialUsage", "error", { error })
      throw error
    }
  }
}
