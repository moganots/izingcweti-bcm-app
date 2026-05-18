import { BaseService } from '../BaseService'
import {
  Notification,
  NotificationCounts,
  NotificationPreference,
} from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import { NotificationQueryParams, PaginatedResponse } from './../../../types'

/**
 * Update Notification Preferences Request
 */
export interface UpdatePreferencesRequest {
  notification_type: string
  email_enabled?: boolean
  sms_enabled?: boolean
  push_enabled?: boolean
  in_app_enabled?: boolean
}

/**
 * Notification API Service
 */
export class NotificationService extends BaseService {
  /**
   * Get user notifications with pagination
   */
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, params)
  }

  /**
   * Get current user's notifications
   */
  async getMyNotifications(user_id: string): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(user_id))
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.UNREAD)
  }

  /**
   * Get notification counts
   */
  async getNotificationCounts(): Promise<NotificationCounts> {
    const response = await this.get<NotificationCounts>(API_ENDPOINTS.NOTIFICATIONS.COUNTS)
    return this.extractData(response)
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  }

  /**
   * Archive a notification
   */
  async archive(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(id))
  }

  /**
   * Dismiss a notification
   */
  async dismiss(id: string): Promise<void> {
    await this.patch(`/notifications/${id}/dismiss`)
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await this.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`)
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await this.get<NotificationPreference[]>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    )
    return this.extractData(response)
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference> {
    const response = await this.put<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      data
    )
    return this.extractData(response)
  }

  /**
   * Create a notification (for testing/admin)
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const response = await this.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, data)
    return this.extractData(response)
  }
}

// Export singleton
export const notificationService = new NotificationService()
