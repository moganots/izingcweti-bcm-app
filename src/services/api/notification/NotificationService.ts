import { BaseService } from '../../BaseService'
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
 * Bulk Delete Request
 */
export interface BulkDeleteRequest {
  notification_ids: string[]
}

/**
 * Notification API Service
 * Aligned with backend routes
 */
export class NotificationService extends BaseService {
  /**
   * Get current user's notifications with pagination
   * GET /api/notifications
   */
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, params)
  }

  /**
   * Get notification by ID
   * GET /api/notifications/:uuid
   */
  async getNotification(id: string): Promise<Notification> {
    const response = await this.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Get unread notifications
   * GET /api/notifications/unread
   */
  async getUnreadNotifications(): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(API_ENDPOINTS.NOTIFICATIONS.UNREAD)
  }

  /**
   * Get notification counts
   * GET /api/notifications/counts
   */
  async getNotificationCounts(): Promise<NotificationCounts> {
    const response = await this.get<NotificationCounts>(API_ENDPOINTS.NOTIFICATIONS.COUNTS)
    return this.extractData(response)
  }

  /**
   * Get notifications by status
   * GET /api/notifications/status/:status
   */
  async getNotificationsByStatus(status: string): Promise<PaginatedResponse<Notification>> {
    const url = `/notifications/status/${status}`
    return this.getPaginated<Notification>(url)
  }

  /**
   * Get notifications by type
   * GET /api/notifications/type/:type
   */
  async getNotificationsByType(type: string): Promise<PaginatedResponse<Notification>> {
    const url = `/notifications/type/${type}`
    return this.getPaginated<Notification>(url)
  }

  /**
   * Mark notification as read
   * PATCH /api/notifications/:uuid/read
   */
  async markAsRead(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  }

  /**
   * Mark notification as unread
   * PATCH /api/notifications/:uuid/unread
   */
  async markAsUnread(id: string): Promise<void> {
    const url = `/notifications/${id}/unread`
    await this.patch(url)
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  async markAllAsRead(): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  }

  /**
   * Archive a notification
   * PATCH /api/notifications/:uuid/archive
   */
  async archive(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(id))
  }

  /**
   * Dismiss a notification
   * PATCH /api/notifications/:uuid/dismiss
   */
  async dismiss(id: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.DISMISS(id))
  }

  /**
   * Delete notification (soft delete)
   * DELETE /api/notifications/:uuid
   */
  async deleteNotification(id: string): Promise<void> {
    await this.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`)
  }

  /**
   * Permanently delete notification
   * DELETE /api/notifications/:uuid/permanent
   */
  async permanentDelete(id: string): Promise<void> {
    const url = `/notifications/${id}/permanent`
    await this.delete(url)
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await this.get<NotificationPreference[]>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    )
    return this.extractData(response)
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference> {
    const response = await this.put<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      data
    )
    return this.extractData(response)
  }

  /**
   * Create a notification (admin)
   * POST /api/notifications
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const response = await this.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, data)
    return this.extractData(response)
  }

  /**
   * Bulk create notifications (admin)
   * POST /api/notifications/bulk
   */
  async bulkCreateNotifications(
    notifications: Partial<Notification>[]
  ): Promise<{ created: number }> {
    const response = await this.post<{ created: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/bulk`,
      {
        notifications,
      }
    )
    return this.extractData(response)
  }

  /**
   * Bulk delete notifications (admin)
   * POST /api/notifications/bulk/delete
   */
  async bulkDeleteNotifications(notificationIds: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/bulk/delete`,
      {
        notification_ids: notificationIds,
      }
    )
    return this.extractData(response)
  }
}

// Export singleton
export const notificationService = new NotificationService()
