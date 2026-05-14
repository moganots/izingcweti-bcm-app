import { apiClient } from '../../boot/axios'
import type { AxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  QueryParams,
} from '../../types/common.types'

/**
 * Base API Service
 * Provides common HTTP methods for all API services
 */
export abstract class BaseService {
  /**
   * GET request
   */
  protected async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, { ...config, params })
    return response.data
  }

  /**
   * GET paginated request
   */
  protected async getPaginated<T = any>(
    url: string,
    params?: PaginationParams & QueryParams,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(url, {
      ...config,
      params,
    })
    return response.data
  }

  /**
   * POST request
   */
  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  protected async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * Upload file(s)
   */
  protected async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  }

  /**
   * Download file
   */
  protected async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await apiClient.get(url, {
      ...config,
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }

  /**
   * Extract data from API response
   */
  protected extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Request failed')
    }
    return response.data
  }

  /**
   * Build query string from params object
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    return searchParams.toString()
  }
}
