import { BaseService } from './../../BaseService'
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
    return this.getPaginated<Notification>('/notifications', params as Record<string, any>)
  }

  async getNotification(id: string): Promise<Notification> {
    const response = await this.get<Notification>(`/notifications/${id}`)
    return this.extractData(response)
  }

  async getUnreadNotifications(): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>('/notifications/unread')
  }

  async getNotificationCounts(): Promise<NotificationCounts> {
    const response = await this.get<NotificationCounts>('/notifications/counts')
    return this.extractData(response)
  }

  async getNotificationsByStatus(
    status: NotificationStatus
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(`/notifications/status/${status}`)
  }

  async getNotificationsByType(type: NotificationType): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(`/notifications/type/${type}`)
  }

  async markAsRead(id: string): Promise<void> {
    await this.patch(`/notifications/${id}/read`)
  }

  async markAsUnread(id: string): Promise<void> {
    await this.patch(`/notifications/${id}/unread`)
  }

  async markAllAsRead(): Promise<void> {
    await this.patch('/notifications/mark-all-read')
  }

  async archive(id: string): Promise<void> {
    await this.patch(`/notifications/${id}/archive`)
  }

  async dismiss(id: string): Promise<void> {
    await this.patch(`/notifications/${id}/dismiss`)
  }

  async deleteNotification(id: string): Promise<void> {
    await this.delete(`/notifications/${id}`)
  }

  async permanentDelete(id: string): Promise<void> {
    await this.delete(`/notifications/${id}/permanent`)
  }

  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await this.get<NotificationPreference[]>('/notifications/preferences')
    return this.extractData(response)
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference> {
    const response = await this.put<NotificationPreference>('/notifications/preferences', data)
    return this.extractData(response)
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const response = await this.post<Notification>('/notifications', data)
    return this.extractData(response)
  }

  async bulkCreateNotifications(data: NotificationBatchRequest): Promise<NotificationBatchResult> {
    const response = await this.post<NotificationBatchResult>('/notifications/bulk', data)
    return this.extractData(response)
  }

  async bulkDeleteNotifications(notificationIds: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>('/notifications/bulk-delete', {
      notification_ids: notificationIds,
    })
    return this.extractData(response)
  }

  async getUserSettings(userId: string): Promise<UserNotificationSettings> {
    const response = await this.get<UserNotificationSettings>(`/notifications/settings/${userId}`)
    return this.extractData(response)
  }

  async updateUserSettings(
    userId: string,
    settings: Partial<UserNotificationSettings>
  ): Promise<UserNotificationSettings> {
    const response = await this.put<UserNotificationSettings>(
      `/notifications/settings/${userId}`,
      settings
    )
    return this.extractData(response)
  }

  async trackClick(notificationId: string, actionUrl: string): Promise<void> {
    await this.post(`/notifications/${notificationId}/track-click`, { action_url: actionUrl })
  }

  async getNotificationSummary(startDate?: string, endDate?: string): Promise<NotificationSummary> {
    const params = { start_date: startDate, end_date: endDate }
    const response = await this.get<NotificationSummary>('/notifications/summary', params)
    return this.extractData(response)
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const response = await this.get<NotificationTemplate[]>('/notifications/templates')
    return this.extractData(response)
  }

  async createNotificationTemplate(
    data: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> {
    const response = await this.post<NotificationTemplate>('/notifications/templates', data)
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
}

export const notificationService = new NotificationService()
