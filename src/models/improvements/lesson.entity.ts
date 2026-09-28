import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, BusinessUnit, Department } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";

// ============================================
// Improvements Module - Enums (Aligned with Backend)
// ============================================

export enum LessonStatus {
  DRAFT = "Draft",
  UNDER_REVIEW = "Under Review",
  ACTION_PLANNED = "Action Planned",
  IMPLEMENTED = "Implemented",
  CLOSED = "Closed",
  REJECTED = "Rejected",
}

export enum LessonSource {
  INCIDENT = "Incident",
  EXERCISE = "Exercise",
  AUDIT = "Audit",
  EXTERNAL_BENCHMARK = "External Benchmark",
  AFTER_ACTION_REVIEW = "After Action Review",
  STAKEHOLDER_FEEDBACK = "Stakeholder Feedback",
  OTHER = "Other",
}

export enum LessonPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export enum LessonCategory {
  PROCESS = "Process",
  TECHNOLOGY = "Technology",
  PEOPLE = "People",
  COMMUNICATION = "Communication",
  LEADERSHIP = "Leadership",
  TRAINING = "Training",
  CULTURE = "Culture",
  RESOURCES = "Resources",
  COMPLIANCE = "Compliance",
  OTHER = "Other",
}

// ============================================
// Lesson Entity - Aligned with Backend
// Backend: src/modules/improvements/models/entities/lesson.entity.ts
// ============================================

export interface LessonEntity extends BaseEntity {
  organisationId: string;
  businessUnitId?: string;
  departmentId?: string;
  title: string;
  description?: string;
  whatHappened: string;
  lesson: string;
  recommendedActions: string;
  status: LessonStatus;
  source: LessonSource;
  priority: LessonPriority;
  category: LessonCategory;
  sourceId?: string;
  sourceType?: string;
  identifiedBy: string;
  identifiedAt: Date;
  implementedAt?: Date;
  closedAt?: Date;
  effectivenessRating?: number;
  tags: string[];
  relatedActions: string[];
  attachments: string[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  metadata?: Record<string, any>;

  // Relationships
  organisation?: Organisation;
  businessUnit?: BusinessUnit;
  department?: Department;
  identifiedByUser?: User;
  reviewedByUser?: User;
  createdByUser?: User;
  updatedByUser?: User;
}

// ============================================
// Display Constants & Helpers
// ============================================

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  [LessonStatus.DRAFT]: "Draft",
  [LessonStatus.UNDER_REVIEW]: "Under Review",
  [LessonStatus.ACTION_PLANNED]: "Action Planned",
  [LessonStatus.IMPLEMENTED]: "Implemented",
  [LessonStatus.CLOSED]: "Closed",
  [LessonStatus.REJECTED]: "Rejected",
};

export const LESSON_STATUS_COLORS: Record<LessonStatus, string> = {
  [LessonStatus.DRAFT]: "grey",
  [LessonStatus.UNDER_REVIEW]: "warning",
  [LessonStatus.ACTION_PLANNED]: "info",
  [LessonStatus.IMPLEMENTED]: "positive",
  [LessonStatus.CLOSED]: "grey-7",
  [LessonStatus.REJECTED]: "negative",
};

export const LESSON_SOURCE_LABELS: Record<LessonSource, string> = {
  [LessonSource.INCIDENT]: "Incident",
  [LessonSource.EXERCISE]: "Exercise",
  [LessonSource.AUDIT]: "Audit",
  [LessonSource.EXTERNAL_BENCHMARK]: "External Benchmark",
  [LessonSource.AFTER_ACTION_REVIEW]: "After Action Review",
  [LessonSource.STAKEHOLDER_FEEDBACK]: "Stakeholder Feedback",
  [LessonSource.OTHER]: "Other",
};

export const LESSON_PRIORITY_LABELS: Record<LessonPriority, string> = {
  [LessonPriority.LOW]: "Low",
  [LessonPriority.MEDIUM]: "Medium",
  [LessonPriority.HIGH]: "High",
  [LessonPriority.CRITICAL]: "Critical",
};

export const LESSON_PRIORITY_COLORS: Record<LessonPriority, string> = {
  [LessonPriority.LOW]: "grey",
  [LessonPriority.MEDIUM]: "info",
  [LessonPriority.HIGH]: "orange",
  [LessonPriority.CRITICAL]: "negative",
};

export const LESSON_CATEGORY_LABELS: Record<LessonCategory, string> = {
  [LessonCategory.PROCESS]: "Process",
  [LessonCategory.TECHNOLOGY]: "Technology",
  [LessonCategory.PEOPLE]: "People",
  [LessonCategory.COMMUNICATION]: "Communication",
  [LessonCategory.LEADERSHIP]: "Leadership",
  [LessonCategory.TRAINING]: "Training",
  [LessonCategory.CULTURE]: "Culture",
  [LessonCategory.RESOURCES]: "Resources",
  [LessonCategory.COMPLIANCE]: "Compliance",
  [LessonCategory.OTHER]: "Other",
};

export function getLessonStatusLabel(status: LessonStatus): string {
  return LESSON_STATUS_LABELS[status] || status;
}

export function getLessonStatusColor(status: LessonStatus): string {
  return LESSON_STATUS_COLORS[status] || "grey";
}

export function getLessonSourceLabel(source: LessonSource): string {
  return LESSON_SOURCE_LABELS[source] || source;
}

export function getLessonPriorityLabel(priority: LessonPriority): string {
  return LESSON_PRIORITY_LABELS[priority] || priority;
}

export function getLessonPriorityColor(priority: LessonPriority): string {
  return LESSON_PRIORITY_COLORS[priority] || "grey";
}

export function getLessonCategoryLabel(category: LessonCategory): string {
  return LESSON_CATEGORY_LABELS[category] || category;
}

export function isLessonActionable(lesson: LessonEntity): boolean {
  return (
    lesson.status === LessonStatus.DRAFT ||
    lesson.status === LessonStatus.UNDER_REVIEW ||
    lesson.status === LessonStatus.ACTION_PLANNED
  );
}

export function isLessonCompleted(lesson: LessonEntity): boolean {
  return (
    lesson.status === LessonStatus.IMPLEMENTED ||
    lesson.status === LessonStatus.CLOSED
  );
}