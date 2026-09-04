// ============================================
// Training Store - Pinia Store
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trainingService } from 'src/services/api/training/TrainingService'
import {
    type TrainingCourse,
    type UserCourseProgress,
    type Certification,
    type AttestationDocument,
    type UserAttestation,
    type CourseFilters,
    type ProgressFilters,
    type AttestationFilters,
    type CreateTrainingCourseRequest,
    type UpdateTrainingCourseRequest,
    type EnrollCourseRequest,
    type UpdateProgressRequest,
    type CreateCertificationRequest,
    type UpdateCertificationRequest,
    type AcknowledgeAttestationRequest,
    CourseStatus,
    ProgressStatus,
    AttestationStatus,
} from 'src/models/entities/training/training.entity'

export const useTrainingStore = defineStore('training', () => {
    // ============================================
    // State - Courses
    // ============================================

    const courses = ref<TrainingCourse[]>([])
    const selectedCourse = ref<TrainingCourse | null>(null)
    const coursesLoading = ref(false)
    const coursesTotal = ref(0)
    const coursesPage = ref(1)
    const coursesLimit = ref(10)
    const courseFilters = ref<CourseFilters>({})

    // ============================================
    // State - Progress
    // ============================================

    const progress = ref<UserCourseProgress[]>([])
    const selectedProgress = ref<UserCourseProgress | null>(null)
    const progressLoading = ref(false)
    const progressTotal = ref(0)
    const progressPage = ref(1)
    const progressLimit = ref(10)
    const progressFilters = ref<ProgressFilters>({})

    // ============================================
    // State - Certifications
    // ============================================

    const certifications = ref<Certification[]>([])
    const selectedCertification = ref<Certification | null>(null)
    const certificationsLoading = ref(false)
    const certificationsTotal = ref(0)
    const certificationsPage = ref(1)
    const certificationsLimit = ref(10)

    // ============================================
    // State - Attestations
    // ============================================

    const attestationDocuments = ref<AttestationDocument[]>([])
    const selectedAttestationDocument = ref<AttestationDocument | null>(null)
    const attestationDocumentsLoading = ref(false)
    const attestationDocumentsTotal = ref(0)
    const attestationDocumentsPage = ref(1)
    const attestationDocumentsLimit = ref(10)

    const userAttestations = ref<UserAttestation[]>([])
    const selectedUserAttestation = ref<UserAttestation | null>(null)
    const userAttestationsLoading = ref(false)
    const userAttestationsTotal = ref(0)
    const userAttestationsPage = ref(1)
    const userAttestationsLimit = ref(10)

    // ============================================
    // State - Error
    // ============================================

    const error = ref<string | null>(null)

    // ============================================
    // Getters - Courses
    // ============================================

    const hasCourses = computed(() => courses.value.length > 0)
    const publishedCourses = computed(() => courses.value.filter(c => c.isPublished))
    const draftCourses = computed(() => courses.value.filter(c => c.status === CourseStatus.DRAFT))
    const featuredCourses = computed(() => courses.value.filter(c => c.isFeatured))
    const mandatoryCourses = computed(() => courses.value.filter(c => c.isMandatory))

    // ============================================
    // Getters - Progress
    // ============================================

    const hasProgress = computed(() => progress.value.length > 0)
    const inProgressCourses = computed(() => progress.value.filter(p => p.status === ProgressStatus.IN_PROGRESS))
    const completedCourses = computed(() => progress.value.filter(p => p.status === ProgressStatus.COMPLETED))
    const notStartedCourses = computed(() => progress.value.filter(p => p.status === ProgressStatus.NOT_STARTED))

    const averageProgress = computed(() => {
        if (progress.value.length === 0) return 0
        const total = progress.value.reduce((acc, p) => acc + p.progressPercentage, 0)
        return Math.round(total / progress.value.length)
    })

    // ============================================
    // Getters - Certifications
    // ============================================

    const hasCertifications = computed(() => certifications.value.length > 0)
    const activeCertifications = computed(() => certifications.value.filter(c => c.isActive))
    const expiredCertifications = computed(() => certifications.value.filter(c => c.isExpired))

    // ============================================
    // Getters - Attestations
    // ============================================

    const hasAttestations = computed(() => userAttestations.value.length > 0)
    const pendingAttestations = computed(() => userAttestations.value.filter(a => a.status === AttestationStatus.PENDING))
    const acknowledgedAttestations = computed(() => userAttestations.value.filter(a => a.status === AttestationStatus.ACKNOWLEDGED))
    const expiredAttestations = computed(() => userAttestations.value.filter(a => a.status === AttestationStatus.EXPIRED))

    // ============================================
    // Actions - Courses
    // ============================================

    async function loadCourses(filters?: CourseFilters): Promise<void> {
        coursesLoading.value = true
        error.value = null

        try {
            if (filters) {
                courseFilters.value = { ...courseFilters.value, ...filters }
            }
            const response = await trainingService.getCourses(courseFilters.value)
            courses.value = response.data ?? []
            coursesTotal.value = response.total
            coursesPage.value = response.page
            coursesLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load courses'
            console.error('Failed to load courses:', err)
        } finally {
            coursesLoading.value = false
        }
    }

    async function loadCourseById(id: string): Promise<void> {
        coursesLoading.value = true
        error.value = null

        try {
            selectedCourse.value = await trainingService.getCourseById(id)
        } catch (err: any) {
            error.value = err.message || 'Failed to load course'
            console.error('Failed to load course:', err)
        } finally {
            coursesLoading.value = false
        }
    }

    async function createCourse(data: CreateTrainingCourseRequest): Promise<TrainingCourse> {
        coursesLoading.value = true
        error.value = null

        try {
            const course = await trainingService.createCourse(data)
            courses.value.unshift(course)
            return course
        } catch (err: any) {
            error.value = err.message || 'Failed to create course'
            console.error('Failed to create course:', err)
            throw err
        } finally {
            coursesLoading.value = false
        }
    }

    async function updateCourse(id: string, data: UpdateTrainingCourseRequest): Promise<TrainingCourse> {
        coursesLoading.value = true
        error.value = null

        try {
            const course = await trainingService.updateCourse(id, data)
            const index = courses.value.findIndex(c => c.uuid === id)
            if (index !== -1) {
                courses.value[index] = course
            }
            if (selectedCourse.value?.uuid === id) {
                selectedCourse.value = course
            }
            return course
        } catch (err: any) {
            error.value = err.message || 'Failed to update course'
            console.error('Failed to update course:', err)
            throw err
        } finally {
            coursesLoading.value = false
        }
    }

    async function deleteCourse(id: string): Promise<boolean> {
        coursesLoading.value = true
        error.value = null

        try {
            const success = await trainingService.deleteCourse(id)
            if (success) {
                courses.value = courses.value.filter(c => c.uuid !== id)
                if (selectedCourse.value?.uuid === id) {
                    selectedCourse.value = null
                }
            }
            return success
        } catch (err: any) {
            error.value = err.message || 'Failed to delete course'
            console.error('Failed to delete course:', err)
            throw err
        } finally {
            coursesLoading.value = false
        }
    }

    // ============================================
    // Actions - Progress
    // ============================================

    async function loadProgress(filters?: ProgressFilters): Promise<void> {
        progressLoading.value = true
        error.value = null

        try {
            if (filters) {
                progressFilters.value = { ...progressFilters.value, ...filters }
            }
            const response = await trainingService.getUserProgress(progressFilters.value)
            progress.value = response.data ?? []
            progressTotal.value = response.total
            progressPage.value = response.page
            progressLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load progress'
            console.error('Failed to load progress:', err)
        } finally {
            progressLoading.value = false
        }
    }

    async function loadUserProgressForCourse(userId: string, courseId: string): Promise<void> {
        progressLoading.value = true
        error.value = null

        try {
            selectedProgress.value = await trainingService.getUserProgressForCourse(userId, courseId)
        } catch (err: any) {
            error.value = err.message || 'Failed to load progress'
            console.error('Failed to load progress:', err)
        } finally {
            progressLoading.value = false
        }
    }

    async function enrollInCourse(data: EnrollCourseRequest): Promise<UserCourseProgress> {
        progressLoading.value = true
        error.value = null

        try {
            const result = await trainingService.enrollInCourse(data)
            progress.value.unshift(result)
            return result
        } catch (err: any) {
            error.value = err.message || 'Failed to enroll in course'
            console.error('Failed to enroll in course:', err)
            throw err
        } finally {
            progressLoading.value = false
        }
    }

    async function updateProgress(progressId: string, data: UpdateProgressRequest): Promise<UserCourseProgress> {
        progressLoading.value = true
        error.value = null

        try {
            const result = await trainingService.updateProgress(progressId, data)
            const index = progress.value.findIndex(p => p.uuid === progressId)
            if (index !== -1) {
                progress.value[index] = result
            }
            if (selectedProgress.value?.uuid === progressId) {
                selectedProgress.value = result
            }
            return result
        } catch (err: any) {
            error.value = err.message || 'Failed to update progress'
            console.error('Failed to update progress:', err)
            throw err
        } finally {
            progressLoading.value = false
        }
    }

    // ============================================
    // Actions - Certifications
    // ============================================

    async function loadUserCertifications(userId: string, page?: number, limit?: number): Promise<void> {
        certificationsLoading.value = true
        error.value = null

        try {
            const response = await trainingService.getUserCertifications(userId, page, limit)
            certifications.value = response.data ?? []
            certificationsTotal.value = response.total
            certificationsPage.value = response.page
            certificationsLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load certifications'
            console.error('Failed to load certifications:', err)
        } finally {
            certificationsLoading.value = false
        }
    }

    async function createCertification(data: CreateCertificationRequest): Promise<Certification> {
        certificationsLoading.value = true
        error.value = null

        try {
            const certification = await trainingService.createCertification(data)
            certifications.value.unshift(certification)
            return certification
        } catch (err: any) {
            error.value = err.message || 'Failed to create certification'
            console.error('Failed to create certification:', err)
            throw err
        } finally {
            certificationsLoading.value = false
        }
    }

    async function updateCertification(id: string, data: UpdateCertificationRequest): Promise<Certification> {
        certificationsLoading.value = true
        error.value = null

        try {
            const certification = await trainingService.updateCertification(id, data)
            const index = certifications.value.findIndex(c => c.uuid === id)
            if (index !== -1) {
                certifications.value[index] = certification
            }
            if (selectedCertification.value?.uuid === id) {
                selectedCertification.value = certification
            }
            return certification
        } catch (err: any) {
            error.value = err.message || 'Failed to update certification'
            console.error('Failed to update certification:', err)
            throw err
        } finally {
            certificationsLoading.value = false
        }
    }

    async function deleteCertification(id: string): Promise<boolean> {
        certificationsLoading.value = true
        error.value = null

        try {
            const success = await trainingService.deleteCertification(id)
            if (success) {
                certifications.value = certifications.value.filter(c => c.uuid !== id)
                if (selectedCertification.value?.uuid === id) {
                    selectedCertification.value = null
                }
            }
            return success
        } catch (err: any) {
            error.value = err.message || 'Failed to delete certification'
            console.error('Failed to delete certification:', err)
            throw err
        } finally {
            certificationsLoading.value = false
        }
    }

    // ============================================
    // Actions - Attestations
    // ============================================

    async function loadAttestationDocuments(filters?: AttestationFilters): Promise<void> {
        attestationDocumentsLoading.value = true
        error.value = null

        try {
            const response = await trainingService.getAttestationDocuments(filters)
            attestationDocuments.value = response.data ?? []
            attestationDocumentsTotal.value = response.total
            attestationDocumentsPage.value = response.page
            attestationDocumentsLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load attestation documents'
            console.error('Failed to load attestation documents:', err)
        } finally {
            attestationDocumentsLoading.value = false
        }
    }

    async function loadUserAttestations(userId: string, filters?: AttestationFilters): Promise<void> {
        userAttestationsLoading.value = true
        error.value = null

        try {
            const response = await trainingService.getUserAttestations(userId, filters)
            userAttestations.value = response.data ?? []
            userAttestationsTotal.value = response.total
            userAttestationsPage.value = response.page
            userAttestationsLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load user attestations'
            console.error('Failed to load user attestations:', err)
        } finally {
            userAttestationsLoading.value = false
        }
    }

    async function acknowledgeAttestation(data: AcknowledgeAttestationRequest): Promise<UserAttestation> {
        userAttestationsLoading.value = true
        error.value = null

        try {
            const result = await trainingService.acknowledgeAttestation(data)
            const index = userAttestations.value.findIndex(a => a.uuid === result.uuid)
            if (index !== -1) {
                userAttestations.value[index] = result
            }
            if (selectedUserAttestation.value?.uuid === result.uuid) {
                selectedUserAttestation.value = result
            }
            return result
        } catch (err: any) {
            error.value = err.message || 'Failed to acknowledge attestation'
            console.error('Failed to acknowledge attestation:', err)
            throw err
        } finally {
            userAttestationsLoading.value = false
        }
    }

    // ============================================
    // Utilities
    // ============================================

    function clearError(): void {
        error.value = null
    }

    function reset(): void {
        courses.value = []
        selectedCourse.value = null
        coursesLoading.value = false
        coursesTotal.value = 0
        coursesPage.value = 1
        coursesLimit.value = 10
        courseFilters.value = {}

        progress.value = []
        selectedProgress.value = null
        progressLoading.value = false
        progressTotal.value = 0
        progressPage.value = 1
        progressLimit.value = 10
        progressFilters.value = {}

        certifications.value = []
        selectedCertification.value = null
        certificationsLoading.value = false
        certificationsTotal.value = 0
        certificationsPage.value = 1
        certificationsLimit.value = 10

        attestationDocuments.value = []
        selectedAttestationDocument.value = null
        attestationDocumentsLoading.value = false
        attestationDocumentsTotal.value = 0
        attestationDocumentsPage.value = 1
        attestationDocumentsLimit.value = 10

        userAttestations.value = []
        selectedUserAttestation.value = null
        userAttestationsLoading.value = false
        userAttestationsTotal.value = 0
        userAttestationsPage.value = 1
        userAttestationsLimit.value = 10

        error.value = null
    }

    // ============================================
    // Return
    // ============================================

    return {
        // State - Courses
        courses,
        selectedCourse,
        coursesLoading,
        coursesTotal,
        coursesPage,
        coursesLimit,
        courseFilters,

        // State - Progress
        progress,
        selectedProgress,
        progressLoading,
        progressTotal,
        progressPage,
        progressLimit,
        progressFilters,

        // State - Certifications
        certifications,
        selectedCertification,
        certificationsLoading,
        certificationsTotal,
        certificationsPage,
        certificationsLimit,

        // State - Attestations
        attestationDocuments,
        selectedAttestationDocument,
        attestationDocumentsLoading,
        attestationDocumentsTotal,
        attestationDocumentsPage,
        attestationDocumentsLimit,

        userAttestations,
        selectedUserAttestation,
        userAttestationsLoading,
        userAttestationsTotal,
        userAttestationsPage,
        userAttestationsLimit,

        // State - Error
        error,

        // Getters - Courses
        hasCourses,
        publishedCourses,
        draftCourses,
        featuredCourses,
        mandatoryCourses,

        // Getters - Progress
        hasProgress,
        inProgressCourses,
        completedCourses,
        notStartedCourses,
        averageProgress,

        // Getters - Certifications
        hasCertifications,
        activeCertifications,
        expiredCertifications,

        // Getters - Attestations
        hasAttestations,
        pendingAttestations,
        acknowledgedAttestations,
        expiredAttestations,

        // Actions - Courses
        loadCourses,
        loadCourseById,
        createCourse,
        updateCourse,
        deleteCourse,

        // Actions - Progress
        loadProgress,
        loadUserProgressForCourse,
        enrollInCourse,
        updateProgress,

        // Actions - Certifications
        loadUserCertifications,
        createCertification,
        updateCertification,
        deleteCertification,

        // Actions - Attestations
        loadAttestationDocuments,
        loadUserAttestations,
        acknowledgeAttestation,

        // Utilities
        clearError,
        reset,
    }
})