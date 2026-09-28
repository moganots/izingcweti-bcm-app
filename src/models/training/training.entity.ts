import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";

// ============================================
// Training Module - Enums (Aligned with Backend)
// ============================================

export enum CourseLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "EXPERT",
}

export enum CourseStatus {
  DRAFT = "Draft",
  PUBLISHED = "Published",
  ARCHIVED = "Archived",
  UNDER_REVIEW = "UNDER_REVIEW",
  SUSPENDED = "SUSPENDED",
}

export enum ProgressStatus {
  NOT_STARTED = "NotStarted",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
}

export enum AttestationStatus {
  PENDING = "Pending",
  ACKNOWLEDGED = "Acknowledged",
  EXPIRED = "Expired",
  DECLINED = "Declined",
  OVERDUE = "Overdue",
}

// ============================================
// Training Course Entity - Aligned with Backend
// Backend: src/modules/training/models/entities/training-course.entity.ts
// ============================================

export interface CoursePrerequisite {
  courseId: string;
  courseName: string;
  required: boolean;
}

export interface CourseLearningObjective {
  id: string;
  description: string;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  durationMinutes: number;
  contentUrl?: string;
  quizId?: string;
}

export interface TrainingCourse extends BaseEntity {
  organisationId: string;
  name: string;
  description?: string;
  level: CourseLevel;
  status: CourseStatus;
  durationHours: number;
  durationMinutes: number;
  estimatedCompletionDays?: number;
  contentUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  resourceUrl?: string;
  category?: string;
  tags?: string[];
  prerequisites?: CoursePrerequisite[];
  learningObjectives?: CourseLearningObjective[];
  modules?: CourseModule[];
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: string;
  isFeatured: boolean;
  isMandatory: boolean;
  order: number;
  certificationId?: string;
  passingScore?: number;
  isCertificationRequired: boolean;
  certificationValidityDays?: number;
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  ratingCount: number;
  lastAccessedAt?: Date;
  allowSelfEnrollment: boolean;
  requireApproval: boolean;
  maxAttempts: number;
  instructorId?: string;

  // Relationships
  organisation?: Organisation;
  instructor?: User;
  publisher?: User;
  userProgress?: UserCourseProgress[];
}

// ============================================
// User Course Progress Entity - Aligned with Backend
// Backend: src/modules/training/models/entities/user-course-progress.entity.ts
// ============================================

export interface UserCourseProgress extends BaseEntity {
  userId: string;
  courseId: string;
  progressPercentage: number;
  status: ProgressStatus;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  timeSpentMinutes: number;
  lastModuleId?: string;
  completedModules?: string[];
  quizScores?: Record<string, number>;
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
  certificateUrl?: string;

  // Relationships
  user?: User;
  course?: TrainingCourse;
}

// ============================================
// Certification Entity - Aligned with Backend
// Backend: src/modules/training/models/entities/certification.entity.ts
// ============================================

export interface Certification extends BaseEntity {
  userId: string;
  certificationName: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  issuingBody: string;
  credentialId?: string;
  certificationCode?: string;
  grade?: string;
  score?: number;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;

  // Relationships
  user?: User;
  verifier?: User;
}

// ============================================
// Attestation Document Entity - Aligned with Backend
// Backend: src/modules/training/models/entities/attestation-document.entity.ts
// ============================================

export interface AttestationDocument extends BaseEntity {
  title: string;
  attestationVersion: string;
  content: string;
  dueDays: number;
  requiredForRoles?: string[];
  isActive: boolean;
  userAttestations?: UserAttestation[];
}

// ============================================
// User Attestation Entity - Aligned with Backend
// Backend: src/modules/training/models/entities/user-attestation.entity.ts
// ============================================

export interface UserAttestation extends BaseEntity {
  userId: string;
  attestationId: string;
  status: AttestationStatus;
  acknowledgedAt?: Date;
  dueDate: Date;

  // Relationships
  user?: User;
  document?: AttestationDocument;
}

// ============================================
// Helper Functions
// ============================================

export const TrainingCourseHelpers = {
  isActive: (course: TrainingCourse): boolean => {
    return course.status === CourseStatus.PUBLISHED && course.isPublished;
  },

  isAvailable: (course: TrainingCourse): boolean => {
    return (
      TrainingCourseHelpers.isActive(course) &&
      (!course.publishedAt || course.publishedAt <= new Date())
    );
  },

  completionRate: (course: TrainingCourse): number => {
    if (course.enrollmentCount === 0) return 0;
    return (course.completionCount / course.enrollmentCount) * 100;
  },

  totalDurationInMinutes: (course: TrainingCourse): number => {
    return course.durationHours * 60 + course.durationMinutes;
  },

  hasModules: (course: TrainingCourse): boolean => {
    return (course.modules?.length ?? 0) > 0;
  },

  moduleCount: (course: TrainingCourse): number => {
    return course.modules?.length || 0;
  },

  totalModuleDuration: (course: TrainingCourse): number => {
    if (!course.modules) return 0;
    return course.modules.reduce(
      (total, module) => total + module.durationMinutes,
      0
    );
  },

  isCertificationEligible: (course: TrainingCourse): boolean => {
    return course.isCertificationRequired && !!course.certificationId;
  },
};

export const CertificationHelpers = {
  isExpired: (certification: Certification): boolean => {
    if (!certification.expiryDate) return false;
    return certification.expiryDate < new Date();
  },

  isActive: (certification: Certification): boolean => {
    return (
      !CertificationHelpers.isExpired(certification) &&
      certification.isVerified
    );
  },

  daysUntilExpiry: (certification: Certification): number | null => {
    if (!certification.expiryDate) return null;
    const now = new Date();
    const diffTime = certification.expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  displayName: (certification: Certification): string => {
    return `${certification.certificationName}${
      certification.certificationCode
        ? ` (${certification.certificationCode})`
        : ""
    }`;
  },
};

export const UserCourseProgressHelpers = {
  isCompleted: (progress: UserCourseProgress): boolean => {
    return progress.status === ProgressStatus.COMPLETED;
  },

  isInProgress: (progress: UserCourseProgress): boolean => {
    return progress.status === ProgressStatus.IN_PROGRESS;
  },

  isNotStarted: (progress: UserCourseProgress): boolean => {
    return progress.status === ProgressStatus.NOT_STARTED;
  },

  daysSinceStarted: (progress: UserCourseProgress): number | null => {
    if (!progress.startedAt) return null;
    const now = new Date();
    const diffTime = now.getTime() - progress.startedAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  completionPercentage: (progress: UserCourseProgress): number => {
    return Math.min(100, Math.max(0, progress.progressPercentage));
  },
};

// ============================================
// Display Constants
// ============================================

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.BEGINNER]: "Beginner",
  [CourseLevel.INTERMEDIATE]: "Intermediate",
  [CourseLevel.ADVANCED]: "Advanced",
  [CourseLevel.EXPERT]: "Expert",
};

export const COURSE_LEVEL_COLORS: Record<CourseLevel, string> = {
  [CourseLevel.BEGINNER]: "green",
  [CourseLevel.INTERMEDIATE]: "orange",
  [CourseLevel.ADVANCED]: "purple",
  [CourseLevel.EXPERT]: "red",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "Draft",
  [CourseStatus.PUBLISHED]: "Published",
  [CourseStatus.ARCHIVED]: "Archived",
  [CourseStatus.UNDER_REVIEW]: "Under Review",
  [CourseStatus.SUSPENDED]: "Suspended",
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "grey",
  [CourseStatus.PUBLISHED]: "positive",
  [CourseStatus.ARCHIVED]: "grey-7",
  [CourseStatus.UNDER_REVIEW]: "warning",
  [CourseStatus.SUSPENDED]: "orange",
};

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  [ProgressStatus.NOT_STARTED]: "Not Started",
  [ProgressStatus.IN_PROGRESS]: "In Progress",
  [ProgressStatus.COMPLETED]: "Completed",
};

export const PROGRESS_STATUS_COLORS: Record<ProgressStatus, string> = {
  [ProgressStatus.NOT_STARTED]: "grey",
  [ProgressStatus.IN_PROGRESS]: "warning",
  [ProgressStatus.COMPLETED]: "positive",
};

export const ATTESTATION_STATUS_LABELS: Record<AttestationStatus, string> = {
  [AttestationStatus.PENDING]: "Pending",
  [AttestationStatus.ACKNOWLEDGED]: "Acknowledged",
  [AttestationStatus.EXPIRED]: "Expired",
  [AttestationStatus.OVERDUE]: "Overdue",
  [AttestationStatus.DECLINED]: "Declined",
};

export const ATTESTATION_STATUS_COLORS: Record<AttestationStatus, string> = {
  [AttestationStatus.PENDING]: "warning",
  [AttestationStatus.ACKNOWLEDGED]: "positive",
  [AttestationStatus.EXPIRED]: "red",
  [AttestationStatus.OVERDUE]: "negative",
  [AttestationStatus.DECLINED]: "orange",
};

export function getCourseLevelLabel(level: CourseLevel): string {
  return COURSE_LEVEL_LABELS[level] || level;
}

export function getCourseLevelColor(level: CourseLevel): string {
  return COURSE_LEVEL_COLORS[level] || "grey";
}

export function getCourseStatusLabel(status: CourseStatus): string {
  return COURSE_STATUS_LABELS[status] || status;
}

export function getCourseStatusColor(status: CourseStatus): string {
  return COURSE_STATUS_COLORS[status] || "grey";
}

export function getProgressStatusLabel(status: ProgressStatus): string {
  return PROGRESS_STATUS_LABELS[status] || status;
}

export function getProgressStatusColor(status: ProgressStatus): string {
  return PROGRESS_STATUS_COLORS[status] || "grey";
}

export function getAttestationStatusLabel(status: AttestationStatus): string {
  return ATTESTATION_STATUS_LABELS[status] || status;
}

export function getAttestationStatusColor(status: AttestationStatus): string {
  return ATTESTATION_STATUS_COLORS[status] || "grey";
}