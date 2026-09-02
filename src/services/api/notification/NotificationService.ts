import { BaseService } from './../../BaseService';
import { API_ENDPOINTS } from './../../../core/constants/api.constants';
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  CreateNotificationRequest,
  BulkCreateNotificationRequest,
  NotificationQueryParams,
  NotificationCountResponse,
  NotificationStats,
  TemplateStats,
} from './../../../models/entities/notification/notification.entity';
import { PaginatedResponse } from './../../../shared/types/common.types';

export class NotificationService extends BaseService {
  constructor() {
    super();
  }

  // ============================================
  // Notification Endpoints
  // ============================================

  async getMyNotifications(params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      params as Record<string, any>
    );
  }

  async getNotificationById(uuid: string): Promise<Notification> {
    const response = await this.get<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BY_ID(uuid)
    );
    return this.extractData(response);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await this.get<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return this.extractData(response);
  }

  async getNotificationCounts(): Promise<NotificationCountResponse> {
    const response = await this.get<NotificationCountResponse>(
      API_ENDPOINTS.NOTIFICATIONS.COUNTS
    );
    return this.extractData(response);
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const response = await this.post<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      data
    );
    return this.extractData(response);
  }

  async bulkCreateNotifications(data: BulkCreateNotificationRequest): Promise<Notification[]> {
    const response = await this.post<Notification[]>(
      API_ENDPOINTS.NOTIFICATIONS.BULK,
      data
    );
    return this.extractData(response);
  }

  async markAsRead(uuid: string): Promise<void> {
    await this.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(uuid));
  }

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await this.patch<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return this.extractData(response);
  }

  async archiveNotification(uuid: string): Promise<Notification> {
    const response = await this.patch<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(uuid)
    );
    return this.extractData(response);
  }

  async deleteNotification(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(uuid));
  }

  // ============================================
  // Preference Endpoints
  // ============================================

  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await this.get<NotificationPreference[]>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return this.extractData(response);
  }

  async upsertPreference(data: {
    notificationType: string;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
  }): Promise<NotificationPreference> {
    const response = await this.put<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      data
    );
    return this.extractData(response);
  }

  // ============================================
  // Template Endpoints (Admin Only)
  // ============================================

  async getTemplates(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<NotificationTemplate>> {
    return this.getPaginated<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATES,
      params as Record<string, any>
    );
  }

  async getTemplateById(uuid: string): Promise<NotificationTemplate> {
    const response = await this.get<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATE_BY_ID(uuid)
    );
    return this.extractData(response);
  }

  async getTemplateByType(notificationType: string): Promise<NotificationTemplate> {
    const response = await this.get<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATE_BY_TYPE(notificationType)
    );
    return this.extractData(response);
  }

  async getActiveTemplateByType(notificationType: string): Promise<NotificationTemplate> {
    const response = await this.get<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.ACTIVE_TEMPLATE_BY_TYPE(notificationType)
    );
    return this.extractData(response);
  }

  async getActiveTemplates(): Promise<NotificationTemplate[]> {
    const response = await this.get<NotificationTemplate[]>(
      API_ENDPOINTS.NOTIFICATIONS.ACTIVE_TEMPLATES
    );
    return this.extractData(response);
  }

  async createTemplate(data: {
    notificationType: string;
    titleTemplate: string;
    messageTemplate: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate> {
    const response = await this.post<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATES,
      data
    );
    return this.extractData(response);
  }

  async updateTemplate(
    uuid: string,
    data: Partial<{
      titleTemplate: string;
      messageTemplate: string;
      isActive: boolean;
    }>
  ): Promise<NotificationTemplate> {
    const response = await this.put<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATE_BY_ID(uuid),
      data
    );
    return this.extractData(response);
  }

  async activateTemplate(uuid: string): Promise<NotificationTemplate> {
    const response = await this.post<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.ACTIVATE_TEMPLATE(uuid)
    );
    return this.extractData(response);
  }

  async deactivateTemplate(uuid: string): Promise<NotificationTemplate> {
    const response = await this.post<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.DEACTIVATE_TEMPLATE(uuid)
    );
    return this.extractData(response);
  }

  async previewTemplate(uuid: string, variables: Record<string, any>): Promise<{ title: string; message: string }> {
    const response = await this.post<{ title: string; message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.PREVIEW_TEMPLATE(uuid),
      { variables }
    );
    return this.extractData(response);
  }

  async getTemplateStats(): Promise<TemplateStats> {
    const response = await this.get<TemplateStats>(
      API_ENDPOINTS.NOTIFICATIONS.TEMPLATE_STATS
    );
    return this.extractData(response);
  }

  async deleteTemplate(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.NOTIFICATIONS.TEMPLATE_BY_ID(uuid));
  }

  // ============================================
  // Stats & Analytics
  // ============================================

  async getNotificationStats(recipientId: string): Promise<NotificationStats> {
    const response = await this.get<NotificationStats>(
      API_ENDPOINTS.NOTIFICATIONS.STATS(recipientId)
    );
    return this.extractData(response);
  }
}

export const notificationService = new NotificationService();