import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  NotificationSettingType,
  type NotificationSettings,
  type ThemeSettings,
  type LanguageSettings,
  type SecuritySettings,
  type SyncSettings as SettingsSyncSettings,
  type Settings,
  type UpdateSettingsRequest,
  type SettingsQueryParams,
  type BulkUpdateSettingsRequest,
  type SettingsExportOptions,
  type SettingsImportResult,
  type SettingsValidationResult,
  type DefaultSettingsTemplate,
  type PaginatedResponse,
} from './../../../modules'

export class SettingsService extends BaseService {
  async getSettings(params?: SettingsQueryParams): Promise<PaginatedResponse<Settings>> {
    return this.getPaginated<Settings>(API_ENDPOINTS.SETTINGS.BASE, params as Record<string, any>)
  }

  async getSettingsById(id: string): Promise<Settings> {
    const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.BY_ID(id))
    return this.extractData(response)
  }

  async getUserSettings(userId: string): Promise<Settings> {
    const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.USER(userId))
    return this.extractData(response)
  }

  async getOrganisationSettings(organisationId: string): Promise<Settings[]> {
    const response = await this.get<Settings[]>(API_ENDPOINTS.SETTINGS.ORGANISATION(organisationId))
    return this.extractData(response)
  }

  async getSystemDefaultSettings(): Promise<Settings> {
    const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.SYSTEM_DEFAULTS)
    return this.extractData(response)
  }

  async createSettings(data: Partial<Settings>): Promise<Settings> {
    const response = await this.post<Settings>(API_ENDPOINTS.SETTINGS.BASE, data)
    return this.extractData(response)
  }

  async updateSettings(id: string, data: UpdateSettingsRequest): Promise<Settings> {
    const response = await this.put<Settings>(API_ENDPOINTS.SETTINGS.BY_ID(id), data)
    return this.extractData(response)
  }

  async updateUserSettings(userId: string, data: UpdateSettingsRequest): Promise<Settings> {
    const response = await this.put<Settings>(API_ENDPOINTS.SETTINGS.USER(userId), data)
    return this.extractData(response)
  }

  async updateOrganisationSettings(
    organisationId: string,
    data: UpdateSettingsRequest
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.ORGANISATION(organisationId),
      data
    )
    return this.extractData(response)
  }

  async deleteSettings(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.SETTINGS.BY_ID(id))
  }

  async resetUserSettings(userId: string): Promise<Settings> {
    const response = await this.post<Settings>(API_ENDPOINTS.SETTINGS.RESET_USER(userId))
    return this.extractData(response)
  }

  async resetOrganisationSettings(organisationId: string): Promise<Settings[]> {
    const response = await this.post<Settings[]>(
      API_ENDPOINTS.SETTINGS.RESET_ORGANISATION(organisationId)
    )
    return this.extractData(response)
  }

  async getUserPreference<T = any>(userId: string, key: string): Promise<T | null> {
    const response = await this.get<T | null>(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key))
    return this.extractData(response)
  }

  async setUserPreference<T = any>(userId: string, key: string, value: T): Promise<Settings> {
    const response = await this.put<Settings>(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key), {
      value,
    })
    return this.extractData(response)
  }

  async deleteUserPreference(userId: string, key: string): Promise<void> {
    await this.delete(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key))
  }

  async getUserPreferences(userId: string, keys: string[]): Promise<Record<string, any>> {
    const response = await this.post<Record<string, any>>(
      API_ENDPOINTS.SETTINGS.PREFERENCES_BULK(userId),
      { keys }
    )
    return this.extractData(response)
  }

  async updateNotificationSettings(
    userId: string,
    notificationType: NotificationSettingType,
    settings: { email?: boolean; push?: boolean; sms?: boolean; in_app?: boolean }
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.NOTIFICATION_SETTINGS(userId, notificationType),
      settings
    )
    return this.extractData(response)
  }

  async bulkUpdateNotificationSettings(
    userId: string,
    settings: NotificationSettings
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.NOTIFICATION_SETTINGS_BULK(userId),
      settings
    )
    return this.extractData(response)
  }

  async updateThemeSettings(userId: string, settings: Partial<ThemeSettings>): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.THEME_SETTINGS(userId),
      settings
    )
    return this.extractData(response)
  }

  async getAvailableThemes(): Promise<Array<{ id: string; name: string; preview_url?: string }>> {
    const response = await this.get<Array<{ id: string; name: string; preview_url?: string }>>(
      '/settings/available-themes'
    )
    return this.extractData(response)
  }

  async updateLanguageSettings(
    userId: string,
    settings: Partial<LanguageSettings>
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.LANGUAGE_SETTINGS(userId),
      settings
    )
    return this.extractData(response)
  }

  async getAvailableLocales(): Promise<Array<{ code: string; name: string; native_name: string }>> {
    const response = await this.get<Array<{ code: string; name: string; native_name: string }>>(
      '/settings/available-locales'
    )
    return this.extractData(response)
  }

  async updateSecuritySettings(
    userId: string,
    settings: Partial<SecuritySettings>
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.SECURITY_SETTINGS(userId),
      settings
    )
    return this.extractData(response)
  }

  async toggleTwoFactor(
    userId: string,
    enabled: boolean,
    method?: string
  ): Promise<{ enabled: boolean; secret?: string }> {
    const response = await this.post<{ enabled: boolean; secret?: string }>(
      `/settings/user/${userId}/two-factor`,
      { enabled, method }
    )
    return this.extractData(response)
  }

  async verifyTwoFactor(userId: string, code: string): Promise<{ verified: boolean }> {
    const response = await this.post<{ verified: boolean }>(
      `/settings/user/${userId}/two-factor/verify`,
      { code }
    )
    return this.extractData(response)
  }

  async updateSyncSettings(
    userId: string,
    settings: Partial<SettingsSyncSettings>
  ): Promise<Settings> {
    const response = await this.put<Settings>(
      API_ENDPOINTS.SETTINGS.SYNC_SETTINGS(userId),
      settings
    )
    return this.extractData(response)
  }

  async triggerSync(userId: string): Promise<{ synced: boolean; changes: number }> {
    const response = await this.post<{ synced: boolean; changes: number }>(
      API_ENDPOINTS.SETTINGS.TRIGGER_SYNC(userId)
    )
    return this.extractData(response)
  }

  async bulkUpdateSettings(data: BulkUpdateSettingsRequest): Promise<SettingsImportResult> {
    const response = await this.post<SettingsImportResult>('/settings/bulk-update', data)
    return this.extractData(response)
  }

  async applySettingsTemplate(
    templateId: string,
    userIds: string[]
  ): Promise<SettingsImportResult> {
    const response = await this.post<SettingsImportResult>(
      API_ENDPOINTS.SETTINGS.APPLY_TEMPLATE(templateId),
      { userIds }
    )
    return this.extractData(response)
  }

  async validateSettings(settings: UpdateSettingsRequest): Promise<SettingsValidationResult> {
    const response = await this.post<SettingsValidationResult>('/settings/validate', settings)
    return this.extractData(response)
  }

  async getSettingsTemplates(): Promise<DefaultSettingsTemplate[]> {
    const response = await this.get<DefaultSettingsTemplate[]>(API_ENDPOINTS.SETTINGS.TEMPLATES)
    return this.extractData(response)
  }

  async createSettingsTemplate(data: DefaultSettingsTemplate): Promise<DefaultSettingsTemplate> {
    const response = await this.post<DefaultSettingsTemplate>(
      API_ENDPOINTS.SETTINGS.TEMPLATES,
      data
    )
    return this.extractData(response)
  }

  async deleteSettingsTemplate(templateId: string): Promise<void> {
    await this.delete(`/settings/templates/${templateId}`)
  }

  async exportSettings(options: SettingsExportOptions): Promise<void> {
    const format = options.format || 'json'
    await this.download(
      '/settings/export',
      `settings_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: options as Record<string, any> }
    )
  }

  async importSettings(
    file: File,
    options?: { overwrite?: boolean }
  ): Promise<SettingsImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.overwrite) formData.append('overwrite', 'true')

    const response = await this.upload<SettingsImportResult>('/settings/import', formData)
    return this.extractData(response)
  }
}

export const settingsService = new SettingsService()
