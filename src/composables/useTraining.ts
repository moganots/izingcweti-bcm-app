import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrainingStore } from '../stores/training/training.store'

export interface UseTrainingOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
}

/**
 * Training composable
 * Aligned with useTrainingStore
 */
export function useTraining(options: UseTrainingOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000 } = options

    const store = useTrainingStore()

    const {
        courses,
        progress,
        certifications,
        attestationDocuments,
        userAttestations,
        isLoading,
        isSaving,
        error,
        publishedCourses,
        draftCourses,
        featuredCourses,
        mandatoryCourses,
        inProgressCourses,
        completedCourses,
        averageProgress,
        activeCertifications,
        expiredCertifications,
        pendingAttestations,
        acknowledgedAttestations,
    } = storeToRefs(store)

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    async function initialize(): Promise<void> {
        if (isReady.value) return
        await store.initialize()
        isReady.value = true
    }

    async function refresh(): Promise<void> {
        await store.initialize()
    }

    function startPolling(): void {
        if (isPolling.value) return
        if (refreshInterval) clearInterval(refreshInterval)
        isPolling.value = true
        refreshInterval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                refresh().catch(console.error)
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

    onMounted(async () => {
        if (autoLoad) await initialize()
        startPolling()
    })

    onUnmounted(() => stopPolling())

    watch(
        () => document.visibilityState,
        (state) => {
            if (state === 'visible' && isPolling.value) {
                refresh().catch(console.error)
            }
        }
    )

    return {
        // State
        courses,
        progress,
        certifications,
        attestationDocuments,
        userAttestations,
        isLoading,
        isSaving,
        error,
        isReady,
        isPolling,

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
        refresh,
        enrollInCourse: store.enrollInCourse,
        updateProgress: store.updateProgress,
        acknowledgeAttestation: store.acknowledgeAttestation,

        // Sub-stores
        courseStore: store.courseStore,
        progressStore: store.progressStore,
        certStore: store.certStore,
        docStore: store.docStore,
        attestationStore: store.attestationStore,

        startPolling,
        stopPolling,
    }
}

export default useTraining