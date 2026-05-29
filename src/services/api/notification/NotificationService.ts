import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  NotificationType,
  NotificationStatus,
  type Notification,
  type NotificationPreference,
  type NotificationTemplate,
  type UserNotificationSettings,
  type NotificationSummary,
  type CreateNotificationRequest,
  type UpdatePreferencesRequest,
  type NotificationBatchRequest,
  type NotificationBatchResult,
  type NotificationQueryParams,
  type NotificationCounts,
  type PaginatedResponse,
} from './../../../modules'

export class NotificationService extends BaseService {
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      params as Record<string, any>
    )
  }

  async getNotification(id: string): Promise<Notification> {
    const response = await this.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))
    return this.extractData(response)
  }

  async getNotificationCounts(): Promise<NotificationCounts> {
    const response = await this.get<NotificationCounts>(API_ENDPOINTS.NOTIFICATIONS.COUNTS)
    return this.extractData(response)
  }

  async markAsRead(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  }

  async markAllAsRead(): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  }

  async archive(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(id))
  }

  async deleteNotification(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))
  }

  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await this.get<NotificationPreference[]>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    )
    return this.extractData(response)
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference> {
    const response = await this.put<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      data
    )
    return this.extractData(response)
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const response = await this.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, data)
    return this.extractData(response)
  }

  async bulkCreateNotifications(data: NotificationBatchRequest): Promise<NotificationBatchResult> {
    const response = await this.post<NotificationBatchResult>(
      API_ENDPOINTS.NOTIFICATIONS.BULK,
      data
    )
    return this.extractData(response)
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const response = await this.get<NotificationTemplate[]>(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES)
    return this.extractData(response)
  }

  async createNotificationTemplate(
    data: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> {
    const response = await this.post<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATES,
      data
    )
    return this.extractData(response)
  }

  async updateNotificationTemplate(
    id: string,
    data: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> {
    const response = await this.put<NotificationTemplate>(`/notifications/templates/${id}`, data)
    return this.extractData(response)
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    await this.delete(`/notifications/templates/${id}`)
  }

  async getUnreadNotifications(): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.UNREAD)
  }

  async getNotificationsByStatus(
    status: NotificationStatus
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_STATUS(status))
  }

  async getNotificationsByType(type: NotificationType): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_TYPE(type))
  }

  async markAsUnread(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_UNREAD(id))
  }

  async dismiss(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.DISMISS(id))
  }

  async permanentDelete(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.NOTIFICATIONS.PERMANENT_DELETE(id))
  }

  async bulkDeleteNotifications(notificationIds: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>(API_ENDPOINTS.NOTIFICATIONS.BULK_DELETE, {
      notification_ids: notificationIds,
    })
    return this.extractData(response)
  }

  async getUserSettings(userId: string): Promise<UserNotificationSettings> {
    const response = await this.get<UserNotificationSettings>(
      API_ENDPOINTS.NOTIFICATIONS.SETTINGS(userId)
    )
    return this.extractData(response)
  }

  async updateUserSettings(
    userId: string,
    settings: Partial<UserNotificationSettings>
  ): Promise<UserNotificationSettings> {
    const response = await this.put<UserNotificationSettings>(
      API_ENDPOINTS.NOTIFICATIONS.SETTINGS(userId),
      settings
    )
    return this.extractData(response)
  }

  async trackClick(notificationId: string, actionUrl: string): Promise<void> {
    await this.post(API_ENDPOINTS.NOTIFICATIONS.TRACK_CLICK(notificationId), {
      action_url: actionUrl,
    })
  }

  async getNotificationSummary(startDate?: string, endDate?: string): Promise<NotificationSummary> {
    const params = { start_date: startDate, end_date: endDate }
    const response = await this.get<NotificationSummary>(
      API_ENDPOINTS.NOTIFICATIONS.SUMMARY,
      params
    )
    return this.extractData(response)
  }
}

export const notificationService = new NotificationService()
