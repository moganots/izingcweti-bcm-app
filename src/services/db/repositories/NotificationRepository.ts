import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type {
  Notification,
  NotificationPreference,
} from '../../../models/entities/notification.entity'

/**
 * Notification Repository
 */
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(table: Table<Notification, string>) {
    super(table, 'notifications')
  }

  /**
   * Find notifications by recipient
   */
  async findByRecipient(userId: string): Promise<Notification[]> {
    return this.findMany({ recipient_id: userId } as Partial<Notification>)
  }

  /**
   * Find unread notifications for a user
   * Fixed: Use filter() on toCollection() for compound conditions
   */
  async findUnread(userId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.recipient_id === userId && n.is_read !== true
      })
      .toArray()
  }

  /**
   * Find notifications by type
   */
  async findByType(type: string): Promise<Notification[]> {
    return this.findMany({ notification_type: type } as Partial<Notification>)
  }

  /**
   * Find notifications by entity type and ID
   * Fixed: Use filter() for compound non-indexed conditions
   */
  async findByEntity(entityType: string, entityId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.entity_type === entityType && n.entity_id === entityId
      })
      .toArray()
  }

  /**
   * Get unread count for a user
   * Fixed: Use filter() and count manually since compound where may not be indexed
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Use filter() to count since compound index may not exist
    const unreadNotifications = await this.table
      .filter((n) => {
        return n.recipient_id === userId && n.is_read !== true
      })
      .toArray()

    return unreadNotifications.length

    // Alternative: If recipient_id is indexed, use where() with single field then filter
    // const collection = await this.table
    //   .where({ recipient_id: userId } as any)
    //   .filter((n) => n.is_read !== true)
    //   .toArray();
    // return collection.length;
  }

  /**
   * Get recent notifications for a user
   * Fixed: Use toCollection() with filter and manual sorting/limiting
   */
  async getRecent(userId: string, limit: number = 20): Promise<Notification[]> {
    const notifications = await this.table
      .filter((n) => {
        return n.recipient_id === userId
      })
      .toArray()

    // Sort by created_at descending
    notifications.sort((a, b) => {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      return dateB.localeCompare(dateA)
    })

    // Return limited results
    return notifications.slice(0, limit)
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const unread = await this.findUnread(userId)
    const now = new Date().toISOString()

    // Use bulk update for better performance
    const updates = unread.map((notification) => ({
      uuid: notification.uuid,
      data: {
        is_read: true,
        status: 'READ' as const,
        read_at: now,
      } as Partial<Notification>,
    }))

    if (updates.length > 0) {
      await this.bulkUpdate(updates)
    }

    return unread.length
  }

  /**
   * Archive old notifications
   */
  async archiveOld(daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)
    const cutoffStr = cutoff.toISOString()

    const oldNotifications = await this.table
      .filter((n) => {
        const createdAt = n.created_at
        // Check if created_at exists and is before cutoff
        if (typeof createdAt !== 'string') {
          return false
        }
        return createdAt < cutoffStr && n.is_read === true && n.status !== 'ARCHIVED'
      })
      .toArray()

    // Bulk update for performance
    const updates = oldNotifications.map((notification) => ({
      uuid: notification.uuid,
      data: {
        status: 'ARCHIVED' as const,
        updated_at: cutoffStr,
      } as Partial<Notification>,
    }))

    if (updates.length > 0) {
      await this.bulkUpdate(updates)
    }

    return oldNotifications.length
  }

  /**
   * Get notifications by priority
   */
  async findByPriority(priority: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return n.priority === priority
      })
      .toArray()
  }

  /**
   * Get high priority unread notifications
   */
  async findHighPriorityUnread(userId: string): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        return (
          n.recipient_id === userId &&
          n.is_read !== true &&
          (n.priority === 'HIGH' || n.priority === 'URGENT')
        )
      })
      .toArray()
  }

  /**
   * Get notification statistics for a user
   */
  async getStats(userId: string): Promise<{
    total: number
    unread: number
    read: number
    archived: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  }> {
    const all = await this.table
      .filter((n) => {
        return n.recipient_id === userId
      })
      .toArray()

    const byType: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    all.forEach((n) => {
      // Count by type
      if (n.notification_type) {
        byType[n.notification_type] = (byType[n.notification_type] || 0) + 1
      }
      // Count by priority
      if (n.priority) {
        byPriority[n.priority] = (byPriority[n.priority] || 0) + 1
      }
    })

    return {
      total: all.length,
      unread: all.filter((n) => n.is_read !== true && n.status !== 'ARCHIVED').length,
      read: all.filter((n) => n.is_read === true).length,
      archived: all.filter((n) => n.status === 'ARCHIVED').length,
      byType,
      byPriority,
    }
  }

  /**
   * Find notifications by date range
   */
  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Notification[]> {
    return this.table
      .filter((n) => {
        const createdAt = n.created_at
        if (typeof createdAt !== 'string') {
          return false
        }
        return n.recipient_id === userId && createdAt >= startDate && createdAt <= endDate
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
        const scheduledFor = n.scheduled_for
        if (typeof scheduledFor !== 'string') {
          return false
        }
        return scheduledFor <= now && n.status !== 'ARCHIVED' && n.status !== 'DISMISSED'
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
        const expiresAt = n.expires_at
        if (typeof expiresAt !== 'string') {
          return false
        }
        return expiresAt <= now && n.status !== 'ARCHIVED'
      })
      .toArray()
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
}

/**
 * Notification Preference Repository
 */
export class NotificationPreferenceRepository extends BaseRepository<NotificationPreference> {
  constructor(table: Table<NotificationPreference, string>) {
    super(table, 'notification_preferences')
  }

  /**
   * Find preferences by user
   */
  async findByUser(userId: string): Promise<NotificationPreference[]> {
    return this.findMany({ user_id: userId } as Partial<NotificationPreference>)
  }

  /**
   * Find preference by user and notification type
   * Fixed: Use filter() for compound condition since compound index may not exist
   */
  async findByUserAndType(
    userId: string,
    type: string
  ): Promise<NotificationPreference | undefined> {
    // Use filter() to find matching preference
    const results = await this.table
      .filter((pref) => {
        return pref.user_id === userId && pref.notification_type === type
      })
      .toArray()

    // Return first match or undefined
    return results.length > 0 ? results[0] : undefined

    // Alternative if both fields are indexed:
    // const collection = this.table.where({ user_id: userId, notification_type: type } as any);
    // return collection.first();
  }

  /**
   * Upsert a notification preference
   */
  async upsertPreference(
    userId: string,
    type: string,
    data: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const existing = await this.findByUserAndType(userId, type)

    if (existing) {
      await this.update(existing.uuid, {
        ...data,
        updated_at: new Date().toISOString(),
      } as Partial<NotificationPreference>)
      return (await this.findById(existing.uuid))!
    } else {
      return this.create({
        user_id: userId,
        notification_type: type,
        email_enabled: true,
        sms_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        ...data,
      } as Partial<NotificationPreference>)
    }
  }

  /**
   * Get all enabled preferences for a user
   */
  async findEnabledPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.table
      .filter((pref) => {
        return (
          pref.user_id === userId &&
          (pref.email_enabled === true ||
            pref.sms_enabled === true ||
            pref.push_enabled === true ||
            pref.in_app_enabled === true)
        )
      })
      .toArray()
  }

  /**
   * Check if a specific channel is enabled for a notification type
   */
  async isChannelEnabled(
    userId: string,
    type: string,
    channel: 'email' | 'sms' | 'push' | 'in_app'
  ): Promise<boolean> {
    const preference = await this.findByUserAndType(userId, type)

    if (!preference) {
      // Default to enabled if no preference set
      return true
    }

    switch (channel) {
      case 'email':
        return preference.email_enabled === true
      case 'sms':
        return preference.sms_enabled === true
      case 'push':
        return preference.push_enabled === true
      case 'in_app':
        return preference.in_app_enabled === true
      default:
        return true
    }
  }

  /**
   * Enable/disable a specific channel for a notification type
   */
  async setChannelEnabled(
    userId: string,
    type: string,
    channel: 'email' | 'sms' | 'push' | 'in_app',
    enabled: boolean
  ): Promise<NotificationPreference> {
    const channelField = `${channel}_enabled` as keyof NotificationPreference

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
}
