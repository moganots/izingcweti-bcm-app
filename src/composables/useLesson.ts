import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLessonStore } from '../stores/improvements/lesson.store'

export interface UseLessonOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
}

/**
 * Lesson composable
 * Aligned with useLessonStore
 */
export function useLesson(options: UseLessonOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000 } = options

    const store = useLessonStore()
    const {
        lessons,
        selectedLesson,
        isLoading,
        isSaving,
        error,
        draftLessons,
        underReviewLessons,
        implementedLessons,
        closedLessons,
        rejectedLessons,
        criticalPriorityLessons,
        highPriorityLessons,
        lessonsWithActions,
        implementationRate,
        averageEffectiveness,
    } = storeToRefs(store)

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    // ============================================
    // Actions
    // ============================================
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

    // ============================================
    // Lifecycle
    // ============================================
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

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        lessons,
        selectedLesson,
        isLoading,
        isSaving,
        error,
        isReady,
        isPolling,

        // Getters
        draftLessons,
        underReviewLessons,
        implementedLessons,
        closedLessons,
        rejectedLessons,
        criticalPriorityLessons,
        highPriorityLessons,
        lessonsWithActions,
        implementationRate,
        averageEffectiveness,

        // Actions
        initialize,
        refresh,
        addRelatedAction: store.addRelatedAction,
        removeRelatedAction: store.removeRelatedAction,

        // Sub-store
        lessonStore: store.lessonStore,

        // Polling
        startPolling,
        stopPolling,
    }
}

export default useLesson