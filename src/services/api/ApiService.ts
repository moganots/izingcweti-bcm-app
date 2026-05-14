import { BaseService } from './BaseService'

/**
 * General API Service
 * Provides access to miscellaneous API endpoints
 */
export class ApiService extends BaseService {
  /**
   * Health check
   */
  async ping(): Promise<{ status: string; timestamp: string }> {
    const response = await this.get<{ status: string; timestamp: string }>('/ping')
    return this.extractData(response)
  }

  /**
   * Get API version
   */
  async getVersion(): Promise<string> {
    const response = await this.get<{ version: string }>('/version')
    return this.extractData(response).version
  }

  /**
   * Search across all entities
   */
  async search(query: string, options?: { entityType?: string; limit?: number }): Promise<any[]> {
    const response = await this.get<any[]>('/search', {
      q: query,
      ...options,
    })
    return this.extractData(response)
  }

  /**
   * Get server time
   */
  async getServerTime(): Promise<string> {
    const response = await this.get<{ serverTime: string }>('/server-time')
    return this.extractData(response).serverTime
  }
}

// Export singleton
export const apiService = new ApiService()
