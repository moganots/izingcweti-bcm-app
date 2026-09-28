import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    TrainingCourse,
    UserCourseProgress,
    Certification,
    AttestationDocument,
    UserAttestation,
} from '../../models/training/training.entity'
import {
    CourseStatus,
    ProgressStatus,
    AttestationStatus,
} from '../../models/training/training.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { useAuthStore } from '../auth/auth.store'

export const useTrainingCourseStore = createOfflineCrudStore<TrainingCourse>({
    storeId: 'training-courses',
    tableName: 'trainingCourses',
})

export const useUserCourseProgressStore = createOfflineCrudStore<UserCourseProgress>({
    storeId: 'user-course-progress',
    tableName: 'userCourseProgress',
})

export const useCertificationStore = createOfflineCrudStore<Certification>({
    storeId: 'certifications',
    tableName: 'certifications',
})

export const useAttestationDocumentStore = createOfflineCrudStore<AttestationDocument>({
    storeId: 'attestation-documents',
    tableName: 'attestationDocuments',
})

export const useUserAttestationStore = createOfflineCrudStore<UserAttestation>({
    storeId: 'user-attestations',
    tableName: 'userAttestations',
})

export const useTrainingStore = defineStore('training', () => {
    const courseStore = useTrainingCourseStore()
    const progressStore = useUserCourseProgressStore()
    const certStore = useCertificationStore()
    const docStore = useAttestationDocumentStore()
    const attestationStore = useUserAttestationStore()
    const authStore = useAuthStore()

    const isSaving = ref(false)

    const courses = courseStore.items
    const progress = progressStore.items
    const certifications = certStore.items
    const attestationDocuments = docStore.items
    const userAttestations = attestationStore.items

    // ============================================
    // Getters - Courses
    // ============================================
    const publishedCourses = computed(() =>
        courses?.filter((c) => c.status === CourseStatus.PUBLISHED && c.isPublished)
    )

    const draftCourses = computed(() =>
        courses?.filter((c) => c.status === CourseStatus.DRAFT)
    )

    const featuredCourses = computed(() => courses?.filter((c) => c.isFeatured))
    const mandatoryCourses = computed(() => courses?.filter((c) => c.isMandatory))

    // ============================================
    // Getters - Progress
    // ============================================
    const inProgressCourses = computed(() =>
        progress?.filter((p) => p.status === ProgressStatus.IN_PROGRESS)
    )

    const completedCourses = computed(() =>
        progress?.filter((p) => p.status === ProgressStatus.COMPLETED)
    )

    const averageProgress = computed(() => {
        if (progress?.length === 0) return 0
        const total = progress?.reduce((acc, p) => acc + p.progressPercentage, 0)
        return Math.round(total / progress?.length)
    })

    // ============================================
    // Getters - Certifications
    // ============================================
    const activeCertifications = computed(() =>
        certifications?.filter(
            (c) => !c.expiryDate || new Date(c.expiryDate) > new Date()
        )
    )

    const expiredCertifications = computed(() =>
        certifications?.filter(
            (c) => c.expiryDate && new Date(c.expiryDate) <= new Date()
        )
    )

    // ============================================
    // Getters - Attestations
    // ============================================
    const pendingAttestations = computed(() =>
        userAttestations?.filter((a) => a.status === AttestationStatus.PENDING)
    )

    const acknowledgedAttestations = computed(() =>
        userAttestations?.filter((a) => a.status === AttestationStatus.ACKNOWLEDGED)
    )

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        await Promise.all([
            courseStore.initialize(),
            progressStore.initialize(),
            certStore.initialize(),
            docStore.initialize(),
            attestationStore.initialize(),
        ])
    }

    async function enrollInCourse(courseId: string): Promise<UserCourseProgress | null> {
        return progressStore.create({
            userId: authStore.userId,
            courseId,
            status: ProgressStatus.NOT_STARTED,
            progressPercentage: 0,
            timeSpentMinutes: 0,
            certificateIssued: false,
        } as Partial<UserCourseProgress>)
    }

    async function updateProgress(
        progressId: string,
        percentage: number
    ): Promise<UserCourseProgress | null> {
        const status =
            percentage >= 100
                ? ProgressStatus.COMPLETED
                : percentage > 0
                    ? ProgressStatus.IN_PROGRESS
                    : ProgressStatus.NOT_STARTED

        const updates: Partial<UserCourseProgress> = {
            progressPercentage: percentage,
            status,
            lastAccessedAt: new Date(),
        }

        if (status === ProgressStatus.COMPLETED) {
            updates.completedAt = new Date()
        }

        return progressStore.update(progressId, updates)
    }

    async function acknowledgeAttestation(id: string): Promise<UserAttestation | null> {
        return attestationStore.update(id, {
            status: AttestationStatus.ACKNOWLEDGED,
            acknowledgedAt: new Date(),
        } as Partial<UserAttestation>)
    }

    return {
        // State
        courses,
        progress,
        certifications,
        attestationDocuments,
        userAttestations,
        isLoading: courseStore.loading,
        isSaving,
        error: courseStore.error,

        // Getters - Courses
        publishedCourses,
        draftCourses,
        featuredCourses,
        mandatoryCourses,

        // Getters - Progress
        inProgressCourses,
        completedCourses,
        averageProgress,

        // Getters - Certifications
        activeCertifications,
        expiredCertifications,

        // Getters - Attestations
        pendingAttestations,
        acknowledgedAttestations,

        // Actions
        initialize,
        enrollInCourse,
        updateProgress,
        acknowledgeAttestation,

        // Sub-stores
        courseStore,
        progressStore,
        certStore,
        docStore,
        attestationStore,
    }
})