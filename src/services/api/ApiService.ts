import { BaseService } from '../BaseService'

export class ApiService extends BaseService {
  async ping(): Promise<{ status: string; timestamp: string }> {
    const response = await this.get<{ status: string; timestamp: string }>('/ping')
    return this.extractData(response)
  }

  async getVersion(): Promise<string> {
    const response = await this.get<{ version: string }>('/version')
    return this.extractData(response).version
  }

  async search(query: string, options?: { entityType?: string; limit?: number }): Promise<any[]> {
    const response = await this.get<any[]>('/search', {
      q: query,
      ...options,
    })
    return this.extractData(response)
  }

  async getServerTime(): Promise<string> {
    const response = await this.get<{ serverTime: string }>('/server-time')
    return this.extractData(response).serverTime
  }
}

export const apiService = new ApiService()
