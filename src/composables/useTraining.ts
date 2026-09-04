// ============================================
// useTraining Composable
// ============================================

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrainingStore } from 'src/stores/training/training.store'
import type {
    TrainingCourse,
    UserCourseProgress,
    Certification,
    UserAttestation,
    CourseFilters,
    ProgressFilters,
    AttestationFilters,
    CreateTrainingCourseRequest,
    UpdateTrainingCourseRequest,
    EnrollCourseRequest,
    UpdateProgressRequest,
    CreateCertificationRequest,
    UpdateCertificationRequest,
    AcknowledgeAttestationRequest,
} from 'src/models/entities/training/training.entity'

export interface UseTrainingOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
    defaultCourseFilters?: CourseFilters
}

/**
 * Training composable
 * Provides reactive training data and operations
 */
export function useTraining(options: UseTrainingOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000, defaultCourseFilters = {} } = options

    const store = useTrainingStore()
    const {
        // Courses
        courses,
        selectedCourse,
        coursesLoading,
        coursesTotal,
        coursesPage,
        coursesLimit,
        courseFilters,
        // Progress
        progress,
        selectedProgress,
        progressLoading,
        progressTotal,
        progressPage,
        progressLimit,
        progressFilters,
        // Certifications
        certifications,
        selectedCertification,
        certificationsLoading,
        certificationsTotal,
        certificationsPage,
        certificationsLimit,
        // Attestations
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
        error,
    } = storeToRefs(store)

    // ============================================
    // Local State
    // ============================================

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    // ============================================
    // Getters - Courses
    // ============================================

    const hasCourses = computed(() => store.hasCourses)
    const publishedCourses = computed(() => store.publishedCourses)
    const draftCourses = computed(() => store.draftCourses)
    const featuredCourses = computed(() => store.featuredCourses)
    const mandatoryCourses = computed(() => store.mandatoryCourses)

    // ============================================
    // Getters - Progress
    // ============================================

    const hasProgress = computed(() => store.hasProgress)
    const inProgressCourses = computed(() => store.inProgressCourses)
    const completedCourses = computed(() => store.completedCourses)
    const notStartedCourses = computed(() => store.notStartedCourses)
    const averageProgress = computed(() => store.averageProgress)

    // ============================================
    // Getters - Certifications
    // ============================================

    const hasCertifications = computed(() => store.hasCertifications)
    const activeCertifications = computed(() => store.activeCertifications)
    const expiredCertifications = computed(() => store.expiredCertifications)

    // ============================================
    // Getters - Attestations
    // ============================================

    const hasAttestations = computed(() => store.hasAttestations)
    const pendingAttestations = computed(() => store.pendingAttestations)
    const acknowledgedAttestations = computed(() => store.acknowledgedAttestations)
    const expiredAttestations = computed(() => store.expiredAttestations)

    // ============================================
    // Methods - Initialization
    // ============================================

    async function initialize(): Promise<void> {
        if (isReady.value) return
        await loadAllData()
        isReady.value = true
    }

    async function loadAllData(): Promise<void> {
        await Promise.all([
            store.loadCourses(defaultCourseFilters),
            store.loadProgress(),
            // Certifications and attestations require userId
        ])
    }

    async function refreshData(): Promise<void> {
        await loadAllData()
    }

    // ============================================
    // Methods - Courses
    // ============================================

    async function loadCourses(filters?: CourseFilters): Promise<void> {
        await store.loadCourses(filters)
    }

    async function loadCourseById(id: string): Promise<void> {
        await store.loadCourseById(id)
    }

    async function createCourse(data: CreateTrainingCourseRequest): Promise<TrainingCourse> {
        return await store.createCourse(data)
    }

    async function updateCourse(id: string, data: UpdateTrainingCourseRequest): Promise<TrainingCourse> {
        return await store.updateCourse(id, data)
    }

    async function deleteCourse(id: string): Promise<boolean> {
        return await store.deleteCourse(id)
    }

    // ============================================
    // Methods - Progress
    // ============================================

    async function loadProgress(filters?: ProgressFilters): Promise<void> {
        await store.loadProgress(filters)
    }

    async function loadUserProgressForCourse(userId: string, courseId: string): Promise<void> {
        await store.loadUserProgressForCourse(userId, courseId)
    }

    async function enrollInCourse(data: EnrollCourseRequest): Promise<UserCourseProgress> {
        return await store.enrollInCourse(data)
    }

    async function updateProgress(progressId: string, data: UpdateProgressRequest): Promise<UserCourseProgress> {
        return await store.updateProgress(progressId, data)
    }

    // ============================================
    // Methods - Certifications
    // ============================================

    async function loadUserCertifications(userId: string, page?: number, limit?: number): Promise<void> {
        await store.loadUserCertifications(userId, page, limit)
    }

    async function createCertification(data: CreateCertificationRequest): Promise<Certification> {
        return await store.createCertification(data)
    }

    async function updateCertification(id: string, data: UpdateCertificationRequest): Promise<Certification> {
        return await store.updateCertification(id, data)
    }

    async function deleteCertification(id: string): Promise<boolean> {
        return await store.deleteCertification(id)
    }

    // ============================================
    // Methods - Attestations
    // ============================================

    async function loadAttestationDocuments(filters?: AttestationFilters): Promise<void> {
        await store.loadAttestationDocuments(filters)
    }

    async function loadUserAttestations(userId: string, filters?: AttestationFilters): Promise<void> {
        await store.loadUserAttestations(userId, filters)
    }

    async function acknowledgeAttestation(data: AcknowledgeAttestationRequest): Promise<UserAttestation> {
        return await store.acknowledgeAttestation(data)
    }

    // ============================================
    // Methods - Polling
    // ============================================

    function startPolling(): void {
        if (isPolling.value) return
        if (refreshInterval) {
            clearInterval(refreshInterval)
        }

        isPolling.value = true
        refreshInterval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshData().catch(console.error)
            }
        }, autoRefreshInterval)
    }

    function stopPolling(): void {
        isPolling.value = false
        if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
        }
    }

    // ============================================
    // Lifecycle
    // ============================================

    onMounted(async () => {
        if (autoLoad) {
            await initialize()
        }
        startPolling()
    })

    onUnmounted(() => {
        stopPolling()
    })

    watch(
        () => document.visibilityState,
        (state) => {
            if (state === 'visible' && isPolling.value) {
                refreshData().catch(console.error)
            }
        }
    )

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

        // State - Readiness
        isReady,
        isPolling,

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

        // Methods - Initialization
        initialize,
        refreshData,
        loadAllData,

        // Methods - Courses
        loadCourses,
        loadCourseById,
        createCourse,
        updateCourse,
        deleteCourse,

        // Methods - Progress
        loadProgress,
        loadUserProgressForCourse,
        enrollInCourse,
        updateProgress,

        // Methods - Certifications
        loadUserCertifications,
        createCertification,
        updateCertification,
        deleteCertification,

        // Methods - Attestations
        loadAttestationDocuments,
        loadUserAttestations,
        acknowledgeAttestation,

        // Methods - Polling
        startPolling,
        stopPolling,

        // Utilities
        clearError: store.clearError,
        reset: store.reset,
    }
}