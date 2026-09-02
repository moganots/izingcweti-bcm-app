import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  Notification,
  NotificationPreference,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationStats,
} from './../../../../models/entities'

const isDateValue = (value: unknown): value is Date =>
  Object.prototype.toString.call(value) === '[object Date]'

/**
 * Notification Repository
 * Handles CRUD operations for Notification entities with camelCase field names
 * Aligned with notification.entity.ts
 */
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(table: Table<Notification, string>) {
    super(table, 'notifications')
  }

  /**
   * Find notifications by recipient
   */
  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return this.findMany({ recipientId } as Partial<Notification>)
  }

  /**
   * Find notifications by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Notification[]> {
    return this.findMany({ organisationId } as Partial<Notification>)
  }

  /**
   * Find notifications by type
   */
  async findByType(type: NotificationType): Promise<Notification[]> {
    return this.findMany({ notificationType: type } as Partial<Notification>)
  }

  /**
   * Find notifications by priority
   */
  async findByPriority(priority: NotificationPriority): Promise<Notification[]> {
    return this.findMany({ priority } as Partial<Notification>)
  }

  /**
   * Find notifications by status
   */
  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    return this.findMany({ status } as Partial<Notification>)
  }

  /**
   * Find unread notifications for a user
   */
  async findUnread(recipientId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.recipientId === recipientId &&
          n.isRead !== true &&
          n.status !== NotificationStatus.ARCHIVED &&
          n.status !== NotificationStatus.DISMISSED
      })
      .toArray()
  }

  /**
   * Find read notifications for a user
   */
  async findRead(recipientId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.recipientId === recipientId && n.isRead === true
      })
      .toArray()
  }

  /**
   * Find archived notifications for a user
   */
  async findArchived(recipientId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.recipientId === recipientId &&
          n.status === NotificationStatus.ARCHIVED
      })
      .toArray()
  }

  /**
   * Find notifications by entity type and ID
   */
  async findByEntity(entityType: string, entityId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.entityType === entityType && n.entityId === entityId
      })
      .toArray()
  }

  /**
   * Find high priority unread notifications for a user
   */
  async findHighPriorityUnread(recipientId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return (
          n.recipientId === recipientId &&
          n.isRead !== true &&
          (n.priority === NotificationPriority.HIGH || n.priority === NotificationPriority.URGENT)
        )
      })
      .toArray()
  }

  /**
   * Find urgent notifications for a user
   */
  async findUrgent(recipientId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.recipientId === recipientId &&
          n.priority === NotificationPriority.URGENT &&
          n.isRead !== true
      })
      .toArray()
  }

  /**
   * Find scheduled notifications that are due
   */
  async findScheduledDue(): Promise<Notification[]> {
    const now = new Date().toISOString()
    return this.table
      .filter((n) => {
        const scheduledFor = n.scheduledFor
        if (!scheduledFor) return false
        const dateStr = Object.prototype.toString.call(scheduledFor) === '[object Date]'
          ? (scheduledFor as Date).toISOString()
          : String(scheduledFor)
        return dateStr <= now &&
          n.status !== NotificationStatus.ARCHIVED &&
          n.status !== NotificationStatus.DISMISSED
      })
      .toArray()
  }

  /**
   * Find expired notifications
   */
  async findExpired(): Promise<Notification[]> {
    const now = new Date().toISOString()
    return this.table
      .filter((n) => {
        const expiresAt = n.expiresAt
        if (!expiresAt) return false
        const dateStr = Object.prototype.toString.call(expiresAt) === '[object Date]'
          ? (expiresAt as Date).toISOString()
          : String(expiresAt)
        return dateStr <= now && n.status !== NotificationStatus.ARCHIVED
      })
      .toArray()
  }

  /**
   * Find notifications by date range
   */
  async findByDateRange(
    recipientId: string,
    startDate: string | Date,
    endDate: string | Date
  ): Promise<Notification[]> {
    const start = startDate instanceof Date ? startDate.toISOString() : startDate
    const end = endDate instanceof Date ? endDate.toISOString() : endDate

    return this.table
      .filter((n) => {
        const createdAt = n.createdAt
        if (!createdAt) return false
        const dateStr = Object.prototype.toString.call(createdAt) === '[object Date]'
          ? (createdAt as unknown as Date).toISOString()
          : String(createdAt)
        return n.recipientId === recipientId && dateStr >= start && dateStr <= end
      })
      .toArray()
  }

  /**
   * Find notifications by channel
   */
  async findByChannel(channel: NotificationChannel): Promise<Notification[]> {
    return this.findMany({ channel } as Partial<Notification>)
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(recipientId: string): Promise<number> {
    const unread = await this.findUnread(recipientId)
    return unread.length
  }

  /**
   * Get recent notifications for a user
   */
  async getRecent(recipientId: string, limit: number = 20): Promise<Notification[]> {
    const notifications = await this.table
      .filter((n) => {
        return n.recipientId === recipientId
      })
      .toArray()

    // Sort by createdAt descending
    notifications.sort((a, b) => {
      const dateA = a.createdAt
      const dateB = b.createdAt
      if (!dateA) return 1
      if (!dateB) return -1

      const timeA = (dateA as any) instanceof Date
        ? (dateA as unknown as Date).getTime()
        : new Date(String(dateA)).getTime()
      const timeB = (dateB as any) instanceof Date
        ? (dateB as unknown as Date).getTime()
        : new Date(String(dateB)).getTime()

      return timeB - timeA
    })

    return notifications.slice(0, limit)
  }

  /**
   * Get notification statistics for a user
   * Returns stats matching NotificationStats interface
   */
  async getStats(recipientId: string): Promise<NotificationStats> {
    const all = await this.table
      .filter((n) => {
        return n.recipientId === recipientId
      })
      .toArray()

    const byType: Record<string, number> = {}
    const byPriority: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    for (const n of all) {
      // Count by type
      const type = n.notificationType || 'UNKNOWN'
      byType[type] = (byType[type] || 0) + 1

      // Count by priority
      const priority = n.priority || NotificationPriority.MEDIUM
      byPriority[priority] = (byPriority[priority] || 0) + 1

      // Count by status
      const status = n.status || NotificationStatus.UNREAD
      byStatus[status] = (byStatus[status] || 0) + 1
    }

    return {
      total: all.length,
      unread: all.filter((n) => n.isRead !== true && n.status !== NotificationStatus.ARCHIVED).length,
      byType,
      byPriority,
      byStatus,
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(recipientId: string): Promise<number> {
    const unread = await this.findUnread(recipientId)
    const now = new Date().toISOString()

    const updates = unread.map((notification) => ({
      uuid: notification.uuid,
      data: {
        isRead: true,
        status: NotificationStatus.READ,
        readAt: now,
        updatedAt: now,
      } as unknown as Partial<Notification>,
    }))

    if (updates.length > 0) {
      await this.bulkUpdate(updates)
    }

    return unread.length
  }

  /**
   * Archive old notifications
   */
  async archiveOld(recipientId: string, daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)

    const oldNotifications = await this.table
      .filter((n) => {
        const createdAt = n.createdAt
        if (!createdAt) return false
        const date = typeof createdAt === 'string' || typeof createdAt === 'number' ? new Date(createdAt) : createdAt as Date
        return date < cutoff &&
          n.recipientId === recipientId &&
          n.isRead === true &&
          n.status !== NotificationStatus.ARCHIVED
      })
      .toArray()

    const updates = oldNotifications.map((notification) => ({
      uuid: notification.uuid,
      data: {
        status: NotificationStatus.ARCHIVED,
        updatedAt: new Date().toISOString(),
      } as unknown as Partial<Notification>,
    }))

    if (updates.length > 0) {
      await this.bulkUpdate(updates)
    }

    return oldNotifications.length
  }

  /**
   * Delete expired notifications
   */
  async deleteExpired(): Promise<number> {
    const expired = await this.findExpired()

    if (expired.length > 0) {
      const ids = expired.map((n) => n.uuid)
      await this.deleteMany(ids)
    }

    return expired.length
  }

  /**
   * Bulk create notifications
   */
  async bulkCreateNotifications(notifications: Partial<Notification>[]): Promise<Notification[]> {
    const results: Notification[] = []

    for (const notification of notifications) {
      const created = await this.create(notification)
      results.push(created)
    }

    return results
  }

  /**
   * Get notifications by multiple recipients
   */
  async findByRecipients(recipientIds: string[]): Promise<Notification[]> {
    const results: Notification[] = []
    for (const id of recipientIds) {
      const notifications = await this.findByRecipient(id)
      results.push(...notifications)
    }
    return results
  }

  /**
   * Get unread count for multiple recipients
   */
  async getUnreadCounts(recipientIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>()
    for (const id of recipientIds) {
      const count = await this.getUnreadCount(id)
      counts.set(id, count)
    }
    return counts
  }

  /**
   * Acknowledge a notification
   */
  async acknowledge(uuid: string, userId: string = 'system'): Promise<Notification | null> {
    const result = await this.update(uuid, {
      isAcknowledged: true,
      acknowledgedAt: new Date().toISOString(),
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    return result || null
  }

  /**
   * Dismiss a notification
   */
  async dismiss(uuid: string, userId: string = 'system'): Promise<Notification | null> {
    const result = await this.update(uuid, {
      status: NotificationStatus.DISMISSED,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    return result || null
  }

  /**
   * Archive a notification
   */
  async archive(uuid: string, userId: string = 'system'): Promise<Notification | null> {
    const result = await this.update(uuid, {
      status: NotificationStatus.ARCHIVED,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    return result || null
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(uuid: string, userId: string = 'system'): Promise<Notification | null> {
    const result = await this.update(uuid, {
      isRead: true,
      status: NotificationStatus.READ,
      readAt: new Date().toISOString(),
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    return result || null
  }

  /**
   * Get delivery status for a notification
   */
  async getDeliveryStatus(uuid: string): Promise<{
    emailDelivered: boolean
    emailDeliveredAt?: Date
    smsDelivered: boolean
    smsDeliveredAt?: Date
    pushDelivered: boolean
    pushDeliveredAt?: Date
    inAppDelivered: boolean
    inAppDeliveredAt?: Date
  } | null> {
    const notification = await this.findById(uuid)
    if (!notification) return null
    return notification.deliveryStatus || null
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    uuid: string,
    channel: 'email' | 'sms' | 'push' | 'inApp',
    delivered: boolean,
    deliveredAt?: Date
  ): Promise<Notification | null> {
    const notification = await this.findById(uuid)
    if (!notification) return null

    const channelKey = channel === 'inApp' ? 'inApp' : channel

    const updates: any = {
      [`deliveryStatus.${channelKey}Delivered`]: delivered,
      [`deliveryStatus.${channelKey}DeliveredAt`]: deliveredAt || new Date(),
    }

    // Also update the channel sent flags
    const sentField = `${channel}Sent` as keyof Notification
    if (sentField in notification) {
      updates[sentField] = true
    }

    const result = await this.update(uuid, {
      ...updates,
      updatedAt: new Date().toISOString(),
    } as Partial<Notification>)

    return result ?? null
  }

  /**
   * Search notifications with filters
   */
  async searchWithFilters(params: {
    recipientId?: string
    organisationId?: string
    notificationType?: NotificationType
    priority?: NotificationPriority
    status?: NotificationStatus
    isRead?: boolean
    startDate?: string | Date
    endDate?: string | Date
    search?: string
  }): Promise<Notification[]> {
    let results = await this.findAll()

    // Filter by recipient
    if (params.recipientId) {
      results = results.filter((n) => n.recipientId === params.recipientId)
    }

    // Filter by organisation
    if (params.organisationId) {
      results = results.filter((n) => n.organisationId === params.organisationId)
    }

    // Filter by type
    if (params.notificationType) {
      results = results.filter((n) => n.notificationType === params.notificationType)
    }

    // Filter by priority
    if (params.priority) {
      results = results.filter((n) => n.priority === params.priority)
    }

    // Filter by status
    if (params.status) {
      results = results.filter((n) => n.status === params.status)
    }

    // Filter by read status
    if (params.isRead !== undefined) {
      results = results.filter((n) => n.isRead === params.isRead)
    }

    // Filter by date range
    if (params.startDate) {
      const start = isDateValue(params.startDate)
        ? params.startDate
        : new Date(params.startDate)
      results = results.filter((n) => {
        const createdAt = n.createdAt
        if (!createdAt) return false
        const date = isDateValue(createdAt)
          ? createdAt
          : new Date(createdAt)
        return date >= start
      })
    }

    if (params.endDate) {
      const end = isDateValue(params.endDate)
        ? params.endDate
        : new Date(params.endDate)
      results = results.filter((n) => {
        const createdAt = n.createdAt
        if (!createdAt) return false
        const date = isDateValue(createdAt)
          ? createdAt
          : new Date(createdAt)
        return date <= end
      })
    }

    // Text search (title, message)
    if (params.search) {
      const lower = params.search.toLowerCase()
      results = results.filter((n) =>
        n.title?.toLowerCase().includes(lower) ||
        n.message?.toLowerCase().includes(lower)
      )
    }

    return results
  }

  /**
   * Count notifications by status for a user
   */
  async countByStatus(recipientId: string): Promise<Record<NotificationStatus, number>> {
    const all = await this.table
      .filter((n) => n.recipientId === recipientId)
      .toArray()

    const counts: Record<NotificationStatus, number> = {
      [NotificationStatus.UNREAD]: 0,
      [NotificationStatus.READ]: 0,
      [NotificationStatus.ARCHIVED]: 0,
      [NotificationStatus.DISMISSED]: 0,
    }

    for (const n of all) {
      const status = n.status || NotificationStatus.UNREAD
      counts[status] = (counts[status] || 0) + 1
    }

    return counts
  }

  /**
   * Get notification count by priority for a user
   */
  async countByPriority(recipientId: string): Promise<Record<NotificationPriority, number>> {
    const all = await this.table
      .filter((n) => n.recipientId === recipientId)
      .toArray()

    const counts: Record<NotificationPriority, number> = {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.MEDIUM]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.URGENT]: 0,
    }

    for (const n of all) {
      const priority = n.priority || NotificationPriority.MEDIUM
      counts[priority] = (counts[priority] || 0) + 1
    }

    return counts
  }

  /**
   * Get unread count by priority for a user
   */
  async getUnreadCountByPriority(recipientId: string): Promise<Record<NotificationPriority, number>> {
    const unread = await this.findUnread(recipientId)
    const counts: Record<NotificationPriority, number> = {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.MEDIUM]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.URGENT]: 0,
    }

    for (const n of unread) {
      const priority = n.priority || NotificationPriority.MEDIUM
      counts[priority] = (counts[priority] || 0) + 1
    }

    return counts
  }
}

/**
 * Notification Preference Repository
 * Handles CRUD operations for NotificationPreference entities with camelCase field names
 */
export class NotificationPreferenceRepository extends BaseRepository<NotificationPreference> {
  constructor(table: Table<NotificationPreference, string>) {
    super(table, 'notification_preferences')
  }

  /**
   * Find preferences by user
   */
  async findByUser(userId: string): Promise<NotificationPreference[]> {
    return this.findMany({ userId } as Partial<NotificationPreference>)
  }

  /**
   * Find preference by user and notification type
   */
  async findByUserAndType(
    userId: string,
    type: NotificationType
  ): Promise<NotificationPreference | undefined> {
    const results = await this.table
      .filter((pref) => {
        return pref.userId === userId && pref.notificationType === type
      })
      .toArray()

    return results.length > 0 ? results[0] : undefined
  }

  /**
   * Upsert a notification preference
   */
  async upsertPreference(
    userId: string,
    type: NotificationType,
    data: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const existing = await this.findByUserAndType(userId, type)

    if (existing) {
      await this.update(existing.uuid, {
        ...data,
        updatedAt: new Date().toISOString(),
      } as unknown as Partial<NotificationPreference>)
      return (await this.findById(existing.uuid))!
    } else {
      return this.create({
        userId,
        notificationType: type,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Partial<NotificationPreference>)
    }
  }

  /**
   * Get all enabled preferences for a user
   */
  async findEnabledPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.table
      .filter((pref) => {
        return (
          pref.userId === userId &&
          (pref.emailEnabled === true ||
            pref.smsEnabled === true ||
            pref.pushEnabled === true ||
            pref.inAppEnabled === true)
        )
      })
      .toArray()
  }

  /**
   * Get preferences by notification type
   */
  async findByType(type: NotificationType): Promise<NotificationPreference[]> {
    return this.findMany({ notificationType: type } as Partial<NotificationPreference>)
  }

  /**
   * Check if a specific channel is enabled for a notification type
   */
  async isChannelEnabled(
    userId: string,
    type: NotificationType,
    channel: 'email' | 'sms' | 'push' | 'inApp'
  ): Promise<boolean> {
    const preference = await this.findByUserAndType(userId, type)

    if (!preference) {
      // Default to enabled if no preference set
      return true
    }

    const channelMap = {
      email: preference.emailEnabled,
      sms: preference.smsEnabled,
      push: preference.pushEnabled,
      inApp: preference.inAppEnabled,
    }

    return channelMap[channel] !== false
  }

  /**
   * Enable/disable a specific channel for a notification type
   */
  async setChannelEnabled(
    userId: string,
    type: NotificationType,
    channel: 'email' | 'sms' | 'push' | 'inApp',
    enabled: boolean
  ): Promise<NotificationPreference> {
    const channelField = `${channel}Enabled` as keyof NotificationPreference

    return this.upsertPreference(userId, type, {
      [channelField]: enabled,
    } as Partial<NotificationPreference>)
  }

  /**
   * Reset preferences to defaults for a user
   */
  async resetToDefaults(userId: string): Promise<void> {
    const preferences = await this.findByUser(userId)
    const ids = preferences.map((p) => p.uuid)
    await this.deleteMany(ids)
  }

  /**
   * Bulk update preferences for a user
   */
  async bulkUpdatePreferences(
    userId: string,
    preferences: Array<{
      notificationType: NotificationType
      emailEnabled?: boolean
      smsEnabled?: boolean
      pushEnabled?: boolean
      inAppEnabled?: boolean
    }>
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = []

    for (const pref of preferences) {
      const updated = await this.upsertPreference(userId, pref.notificationType, pref)
      results.push(updated)
    }

    return results
  }

  /**
   * Get default preferences for a notification type
   */
  getDefaultPreferences(type: NotificationType): Partial<NotificationPreference> {
    return {
      userId: '',
      notificationType: type,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
    }
  }

  /**
   * Check if a user has any enabled channels for a type
   */
  async hasEnabledChannels(userId: string, type: NotificationType): Promise<boolean> {
    const preference = await this.findByUserAndType(userId, type)
    if (!preference) return true

    return (
      preference.emailEnabled === true ||
      preference.smsEnabled === true ||
      preference.pushEnabled === true ||
      preference.inAppEnabled === true
    )
  }
}