import { ApiResponse, PaginatedResponse, QueryParams } from 'src/shared/types/common.types'
import { API_BASE_URL, API_TIMEOUT } from '../core/constants/api.constants'

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>
  timeout?: number
  skipAuth?: boolean
}

export interface UploadProgressCallback {
  (percent: number): void
}

export class BaseService {
  protected baseUrl: string
  protected defaultTimeout: number

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl
    this.defaultTimeout = timeout
  }

  protected getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  protected getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  protected setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  protected setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token)
  }

  protected clearAuthTokens(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  }

  protected async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params)
    const headers = this.buildHeaders(options.headers, options.skipAuth)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw this.handleError(response.status, errorData)
      }

      const data = await response.json()
      return data as ApiResponse<T>
    } catch (error) {
      clearTimeout(timeoutId)
      throw this.handleNetworkError(error)
    }
  }

  protected async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestOptions = { method: 'GET' }
    if (params !== undefined) {
      requestOptions.params = params
    }
    return this.request<T>(endpoint, requestOptions)
  }

  protected async post<T = any>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestOptions = {
      method: 'POST',
    }
    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data)
    }
    if (params !== undefined) {
      requestOptions.params = params
    }
    return this.request<T>(endpoint, requestOptions)
  }

  protected async put<T = any>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestOptions = {
      method: 'PUT',
    }
    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data)
    }
    if (params !== undefined) {
      requestOptions.params = params
    }
    return this.request<T>(endpoint, requestOptions)
  }

  protected async patch<T = any>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestOptions = {
      method: 'PATCH',
    }
    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data)
    }
    if (params !== undefined) {
      requestOptions.params = params
    }
    return this.request<T>(endpoint, requestOptions)
  }

  protected async delete<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestOptions = { method: 'DELETE' }
    if (params !== undefined) {
      requestOptions.params = params
    }
    return this.request<T>(endpoint, requestOptions)
  }

  protected async upload<T = any>(
    endpoint: string,
    formData: FormData,
    onProgress?: UploadProgressCallback
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const headers = this.buildHeaders({}, false)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          xhr.setRequestHeader(key, String(value))
        }
      })

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = (e.loaded / e.total) * 100
          onProgress(percent)
        }
      })

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as ApiResponse<T>
            resolve(response)
          } catch {
            resolve({
              success: true,
              data: xhr.responseText as T,
              timestamp: new Date().toISOString(),
            })
          }
        } else {
          reject(this.handleError(xhr.status, {}))
        }
      }

      xhr.onerror = () => reject(this.handleNetworkError(new Error('Network error')))
      xhr.send(formData)
    })
  }

  protected async download(
    endpoint: string,
    filename?: string,
    options?: { method?: string; params?: Record<string, any> }
  ): Promise<void> {
    const url = this.buildUrl(endpoint, options?.params)
    const headers = this.buildHeaders({}, false)

    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
    })

    if (!response.ok) {
      throw this.handleError(response.status, {})
    }

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename || `download_${Date.now()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(downloadUrl)
  }

  protected async getPaginated<T = any>(
    endpoint: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<{ data: T[]; total: number; page: number; limit: number }>(
      endpoint,
      params as Record<string, any> | undefined
    )
    const data = this.extractData(response)

    return {
      success: true,
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      hasMore: (data.page || 1) * (data.limit || 10) < (data.total || 0),
      timestamp: new Date().toISOString(),
    }
  }

  protected extractData<T = any>(response: ApiResponse<T>): T {
    return response.data ?? ({} as T)
  }

  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    if (!params) return url

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  protected buildHeaders(customHeaders?: HeadersInit, skipAuth?: boolean): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    // Add custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.entries(customHeaders).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            headers[key] = String(value)
          }
        })
      }
    }

    if (!skipAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  protected handleError(status: number, data: any): Error {
    const message = data?.message || data?.error || `HTTP ${status}: Request failed`
    const error = new Error(message) as any
    error.status = status
    error.code = data?.code
    error.details = data?.errors
    return error
  }

  protected handleNetworkError(error: any): Error {
    if (error.name === 'AbortError') {
      return new Error('Request timeout')
    }
    return new Error(error.message || 'Network error')
  }

  protected async refreshAuthToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return false

      const response = await this.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: refreshToken,
      })
      const data = this.extractData(response)

      if (data.access_token) {
        this.setAuthToken(data.access_token)
        return true
      }
      return false
    } catch {
      return false
    }
  }
}
