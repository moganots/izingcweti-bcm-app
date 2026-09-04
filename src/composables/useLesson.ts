// ============================================
// useLesson Composable
// ============================================

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLessonStore } from 'src/stores/improvements/lesson.store'
import type {
    Lesson,
    LessonFilters,
    CreateLessonRequest,
    UpdateLessonRequest,
    BulkLessonAction,
} from 'src/models/entities/improvements/lesson.entity'

export interface UseLessonOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
    defaultFilters?: LessonFilters
}

/**
 * Lesson composable
 * Provides reactive lesson data and operations
 */
export function useLesson(options: UseLessonOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000, defaultFilters = {} } = options

    const store = useLessonStore()
    const {
        lessons,
        selectedLesson,
        lessonStats,
        lessonsLoading,
        lessonsTotal,
        lessonsPage,
        lessonsLimit,
        currentFilters,
        error,
    } = storeToRefs(store)

    // ============================================
    // Local State
    // ============================================

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    // ============================================
    // Getters
    // ============================================

    const hasLessons = computed(() => store.hasLessons)
    const draftLessons = computed(() => store.draftLessons)
    const underReviewLessons = computed(() => store.underReviewLessons)
    const implementedLessons = computed(() => store.implementedLessons)
    const closedLessons = computed(() => store.closedLessons)
    const rejectedLessons = computed(() => store.rejectedLessons)
    const criticalPriorityLessons = computed(() => store.criticalPriorityLessons)
    const highPriorityLessons = computed(() => store.highPriorityLessons)
    const lessonsWithActions = computed(() => store.lessonsWithActions)
    const implementationRate = computed(() => store.implementationRate)
    const averageEffectiveness = computed(() => store.averageEffectiveness)

    // ============================================
    // Methods
    // ============================================

    // ----- Initialization -----

    /**
     * Initialize lesson data
     */
    async function initialize(): Promise<void> {
        if (isReady.value) return

        await loadAllData()
        isReady.value = true
    }

    /**
     * Load all lesson data
     */
    async function loadAllData(): Promise<void> {
        await Promise.all([
            store.loadLessons(defaultFilters),
            store.loadLessonStats(),
        ])
    }

    /**
     * Refresh all lesson data
     */
    async function refreshData(): Promise<void> {
        await loadAllData()
    }

    // ----- CRUD Operations -----

    /**
     * Load lessons with filters
     */
    async function loadLessons(filters?: LessonFilters, page?: number, limit?: number): Promise<void> {
        await store.loadLessons(filters, page, limit)
    }

    /**
     * Load a single lesson by ID
     */
    async function loadLessonById(uuid: string): Promise<void> {
        await store.loadLessonById(uuid)
    }

    /**
     * Load lesson with full details
     */
    async function loadLessonDetail(uuid: string): Promise<void> {
        await store.loadLessonDetail(uuid)
    }

    /**
     * Create a lesson
     */
    async function createLesson(data: CreateLessonRequest): Promise<Lesson> {
        const lesson = await store.createLesson(data)
        await store.loadLessonStats()
        return lesson
    }

    /**
     * Update a lesson
     */
    async function updateLesson(uuid: string, data: UpdateLessonRequest): Promise<Lesson> {
        const lesson = await store.updateLesson(uuid, data)
        await store.loadLessonStats()
        return lesson
    }

    /**
     * Delete a lesson
     */
    async function deleteLesson(uuid: string): Promise<boolean> {
        const success = await store.deleteLesson(uuid)
        if (success) {
            await store.loadLessonStats()
        }
        return success
    }

    // ----- Bulk Operations -----

    /**
     * Bulk update lessons
     */
    async function bulkUpdateLessons(data: BulkLessonAction): Promise<{
        success: number
        failed: number
        errors: string[]
    }> {
        return await store.bulkUpdateLessons(data)
    }

    // ----- Related Actions -----

    /**
     * Add related action to lesson
     */
    async function addRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        return await store.addRelatedAction(uuid, actionId)
    }

    /**
     * Remove related action from lesson
     */
    async function removeRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        return await store.removeRelatedAction(uuid, actionId)
    }

    // ----- Statistics -----

    /**
     * Load lesson statistics
     */
    async function loadStats(): Promise<void> {
        await store.loadLessonStats()
    }

    // ----- Polling -----

    /**
     * Start auto-refresh interval
     */
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

    /**
     * Stop auto-refresh interval
     */
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

    // Watch for visibility change to pause/start polling
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
        // State
        lessons,
        selectedLesson,
        lessonStats,
        lessonsLoading,
        lessonsTotal,
        lessonsPage,
        lessonsLimit,
        currentFilters,
        error,
        isReady,
        isPolling,

        // Getters
        hasLessons,
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

        // Methods
        initialize,
        refreshData,
        loadAllData,

        // CRUD
        loadLessons,
        loadLessonById,
        loadLessonDetail,
        createLesson,
        updateLesson,
        deleteLesson,

        // Bulk
        bulkUpdateLessons,

        // Actions
        addRelatedAction,
        removeRelatedAction,

        // Statistics
        loadStats,

        // Polling
        startPolling,
        stopPolling,

        // Utilities
        clearError: store.clearError,
        reset: store.reset,
    }
}