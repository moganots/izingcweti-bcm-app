import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type {
  Organisation,
  BusinessUnit,
  Department,
} from '../../../models/entities/organisation.entity'

/**
 * Organisation Repository
 */
export class OrganisationRepository extends BaseRepository<Organisation> {
  constructor(table: Table<Organisation, string>) {
    super(table, 'organisations')
  }

  async findByName(name: string): Promise<Organisation | undefined> {
    return this.findOne({ name } as Partial<Organisation>)
  }

  async findByIndustry(industryType: string): Promise<Organisation[]> {
    return this.findMany({ industry_type: industryType } as Partial<Organisation>)
  }

  async findByMaturityScore(score: number): Promise<Organisation[]> {
    return this.findMany({ maturity_score: score } as Partial<Organisation>)
  }

  async getWithBusinessUnits(orgId: string): Promise<Organisation | undefined> {
    return this.findById(orgId)
  }
}

/**
 * Business Unit Repository
 */
export class BusinessUnitRepository extends BaseRepository<BusinessUnit> {
  constructor(table: Table<BusinessUnit, string>) {
    super(table, 'business_units')
  }

  async findByOrganisation(orgId: string): Promise<BusinessUnit[]> {
    return this.findMany({ organisation_id: orgId } as Partial<BusinessUnit>)
  }

  async findByHead(headUserId: string): Promise<BusinessUnit[]> {
    return this.findMany({ head_user_id: headUserId } as Partial<BusinessUnit>)
  }

  async findByCriticality(score: string): Promise<BusinessUnit[]> {
    return this.findMany({ criticality_score: score } as Partial<BusinessUnit>)
  }
}

/**
 * Department Repository
 */
export class DepartmentRepository extends BaseRepository<Department> {
  constructor(table: Table<Department, string>) {
    super(table, 'departments')
  }

  async findByBusinessUnit(businessId: string): Promise<Department[]> {
    return this.findMany({ business_id: businessId } as Partial<Department>)
  }

  async findByName(name: string): Promise<Department | undefined> {
    return this.findOne({ name } as Partial<Department>)
  }
}
