import { BaseEntity } from '../../../core/base/base.entity'
import { TrainingStatus, TrainingType, QuestionType } from '../enums/training.enum'

export interface TrainingCourse extends BaseEntity {
  title: string
  description?: string
  type: TrainingType
  duration_minutes: number
  passing_score: number
  content_url?: string
  thumbnail_url?: string
  is_active: boolean
  organisation_id?: string
  created_by: string
  modules: TrainingModule[]
}

export interface TrainingModule extends BaseEntity {
  course_id: string
  title: string
  order: number
  content: string
  content_type: 'VIDEO' | 'TEXT' | 'PDF' | 'SLIDES' | 'QUIZ'
  duration_minutes: number
  video_url?: string
  attachment_url?: string
}

export interface TrainingQuiz extends BaseEntity {
  module_id: string
  title: string
  passing_score: number
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  correct_answer: string | string[]
  points: number
  explanation?: string
}

export interface UserTraining extends BaseEntity {
  user_id: string
  course_id: string
  status: TrainingStatus
  started_at?: string
  completed_at?: string
  score?: number
  passed: boolean
  certificate_url?: string
  progress_percentage: number
  last_accessed_at?: string
  module_progress: UserModuleProgress[]
}

export interface UserModuleProgress {
  module_id: string
  status: TrainingStatus
  completed_at?: string
  quiz_score?: number
  quiz_passed: boolean
}

export interface TrainingAssignment extends BaseEntity {
  user_id: string
  course_id: string
  assigned_by: string
  assigned_at: string
  due_date?: string
  reminder_sent: boolean
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
}

export interface TrainingCertificate extends BaseEntity {
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  expires_at?: string
  pdf_url: string
  verification_url: string
}

export interface CreateTrainingCourseRequest {
  title: string
  description?: string
  type: TrainingType
  duration_minutes: number
  passing_score: number
  content_url?: string
  organisation_id?: string
}

export interface EnrollTrainingRequest {
  course_id: string
  due_date?: string
}

export interface SubmitQuizRequest {
  module_id: string
  answers: Record<string, string | string[]>
}

export interface QuizResult {
  score: number
  passed: boolean
  percentage: number
  answers: QuizAnswerResult[]
}

export interface QuizAnswerResult {
  question_id: string
  correct: boolean
  correct_answer: string | string[]
  user_answer: string | string[]
  points_earned: number
}

export interface TrainingProgressSummary {
  total_courses: number
  completed_courses: number
  in_progress_courses: number
  not_started_courses: number
  average_score: number
  certificates_earned: number
  total_hours_spent: number
  by_status: Record<string, number>
}

export interface TrainingQueryParams {
  status?: TrainingStatus
  type?: TrainingType
  user_id?: string
  course_id?: string
  assigned_only?: boolean
  page?: number
  limit?: number
}
