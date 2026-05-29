import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../core/constants/api.constants'

export class ApiService extends BaseService {
  async ping(): Promise<{ status: string; timestamp: string }> {
    const response = await this.get<{ status: string; timestamp: string }>(API_ENDPOINTS.API.PING)
    return this.extractData(response)
  }

  async getVersion(): Promise<string> {
    const response = await this.get<{ version: string }>(API_ENDPOINTS.API.VERSION)
    return this.extractData(response).version
  }

  async search(query: string, options?: { entityType?: string; limit?: number }): Promise<any[]> {
    const response = await this.get<any[]>(API_ENDPOINTS.API.SEARCH, {
      q: query,
      ...options,
    })
    return this.extractData(response)
  }

  async getServerTime(): Promise<string> {
    const response = await this.get<{ serverTime: string }>(API_ENDPOINTS.API.SERVER_TIME)
    return this.extractData(response).serverTime
  }
}

export const apiService = new ApiService()
