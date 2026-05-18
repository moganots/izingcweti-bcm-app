import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { User } from './../../../../models/entities'

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  constructor(table: Table<User, string>) {
    super(table, 'users')
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email } as Partial<User>)
  }

  async findByOrganisation(organisationId: string): Promise<User[]> {
    return this.findMany({ organisation_id: organisationId } as Partial<User>)
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findMany({ role } as Partial<User>)
  }

  async findActive(): Promise<User[]> {
    return this.findMany({ is_active: true } as Partial<User>)
  }

  async findInactive(): Promise<User[]> {
    return this.findMany({ is_active: false } as Partial<User>)
  }

  async findTrainingIncomplete(): Promise<User[]> {
    return this.table.filter((user) => user.is_active && !user.training_completed_at).toArray()
  }

  async getUsersByRole(): Promise<Record<string, number>> {
    const all = await this.findAll()
    const roleCounts: Record<string, number> = {}

    all.forEach((user) => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1
    })

    return roleCounts
  }
}
