// ============================================
// Lesson Store - Pinia Store
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lessonService } from '../../services/api/improvements/LessonService'
import type {
    Lesson,
    LessonStats,
    LessonFilters,
    CreateLessonRequest,
    UpdateLessonRequest,
    BulkLessonAction,
} from '../../models/entities/improvements/lesson.entity'

export const useLessonStore = defineStore('lesson', () => {
    // ============================================
    // State
    // ============================================

    // Lessons
    const lessons = ref<Lesson[]>([])
    const selectedLesson = ref<Lesson | null>(null)
    const lessonStats = ref<LessonStats | null>(null)
    const lessonsLoading = ref(false)
    const lessonsTotal = ref(0)
    const lessonsPage = ref(1)
    const lessonsLimit = ref(10)
    const currentFilters = ref<LessonFilters>({})

    // Error state
    const error = ref<string | null>(null)

    // ============================================
    // Getters
    // ============================================

    const hasLessons = computed(() => lessons.value.length > 0)

    const draftLessons = computed(() =>
        lessons.value.filter((l) => l.status === 'DRAFT')
    )

    const underReviewLessons = computed(() =>
        lessons.value.filter((l) => l.status === 'UNDER_REVIEW')
    )

    const implementedLessons = computed(() =>
        lessons.value.filter((l) => l.status === 'IMPLEMENTED')
    )

    const closedLessons = computed(() =>
        lessons.value.filter((l) => l.status === 'CLOSED')
    )

    const rejectedLessons = computed(() =>
        lessons.value.filter((l) => l.status === 'REJECTED')
    )

    const criticalPriorityLessons = computed(() =>
        lessons.value.filter((l) => l.priority === 'CRITICAL')
    )

    const highPriorityLessons = computed(() =>
        lessons.value.filter((l) => l.priority === 'HIGH')
    )

    const lessonsWithActions = computed(() =>
        lessons.value.filter((l) => l.relatedActions && l.relatedActions.length > 0)
    )

    const implementationRate = computed(() => {
        if (lessonStats.value?.total === 0) return 0
        return Math.round(((lessonStats.value?.implemented || 0) / (lessonStats.value?.total || 1)) * 100)
    })

    const averageEffectiveness = computed(() =>
        lessonStats.value?.averageEffectiveness || 0
    )

    // ============================================
    // Actions
    // ============================================

    /**
     * Load lessons with pagination and filters
     */
    async function loadLessons(filters?: LessonFilters, page?: number, limit?: number): Promise<void> {
        lessonsLoading.value = true
        error.value = null

        try {
            if (filters) {
                currentFilters.value = { ...currentFilters.value, ...filters }
            }
            const response = await lessonService.getLessons(
                currentFilters.value,
                page || lessonsPage.value,
                limit || lessonsLimit.value
            )
            lessons.value = response.data ?? []
            lessonsTotal.value = response.total
            lessonsPage.value = response.page
            lessonsLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load lessons'
            console.error('Failed to load lessons:', err)
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Load a single lesson by ID
     */
    async function loadLessonById(uuid: string): Promise<void> {
        lessonsLoading.value = true
        error.value = null

        try {
            selectedLesson.value = await lessonService.getLessonById(uuid)
        } catch (err: any) {
            error.value = err.message || 'Failed to load lesson'
            console.error('Failed to load lesson:', err)
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Load lesson with full details
     */
    async function loadLessonDetail(uuid: string): Promise<void> {
        lessonsLoading.value = true
        error.value = null

        try {
            selectedLesson.value = await lessonService.getLessonDetail(uuid)
        } catch (err: any) {
            error.value = err.message || 'Failed to load lesson details'
            console.error('Failed to load lesson details:', err)
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Create a new lesson
     */
    async function createLesson(data: CreateLessonRequest): Promise<Lesson> {
        lessonsLoading.value = true
        error.value = null

        try {
            const lesson = await lessonService.createLesson(data)
            lessons.value.unshift(lesson)
            await loadLessonStats()
            return lesson
        } catch (err: any) {
            error.value = err.message || 'Failed to create lesson'
            console.error('Failed to create lesson:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Update a lesson
     */
    async function updateLesson(uuid: string, data: UpdateLessonRequest): Promise<Lesson> {
        lessonsLoading.value = true
        error.value = null

        try {
            const lesson = await lessonService.updateLesson(uuid, data)
            const index = lessons.value.findIndex((l) => l.uuid === uuid)
            if (index !== -1) {
                lessons.value[index] = lesson
            }
            if (selectedLesson.value?.uuid === uuid) {
                selectedLesson.value = lesson
            }
            await loadLessonStats()
            return lesson
        } catch (err: any) {
            error.value = err.message || 'Failed to update lesson'
            console.error('Failed to update lesson:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Delete a lesson
     */
    async function deleteLesson(uuid: string): Promise<boolean> {
        lessonsLoading.value = true
        error.value = null

        try {
            const success = await lessonService.deleteLesson(uuid)
            if (success) {
                lessons.value = lessons.value.filter((l) => l.uuid !== uuid)
                if (selectedLesson.value?.uuid === uuid) {
                    selectedLesson.value = null
                }
                await loadLessonStats()
            }
            return success
        } catch (err: any) {
            error.value = err.message || 'Failed to delete lesson'
            console.error('Failed to delete lesson:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Load lesson statistics
     */
    async function loadLessonStats(): Promise<void> {
        lessonsLoading.value = true
        error.value = null

        try {
            lessonStats.value = await lessonService.getLessonStats()
        } catch (err: any) {
            error.value = err.message || 'Failed to load lesson statistics'
            console.error('Failed to load lesson statistics:', err)
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Bulk update lessons
     */
    async function bulkUpdateLessons(data: BulkLessonAction): Promise<{
        success: number
        failed: number
        errors: string[]
    }> {
        lessonsLoading.value = true
        error.value = null

        try {
            const result = await lessonService.bulkUpdateLessons(data)
            await loadLessons()
            await loadLessonStats()
            return result
        } catch (err: any) {
            error.value = err.message || 'Failed to bulk update lessons'
            console.error('Failed to bulk update lessons:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Add related action to lesson
     */
    async function addRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        lessonsLoading.value = true
        error.value = null

        try {
            const lesson = await lessonService.addRelatedAction(uuid, actionId)
            const index = lessons.value.findIndex((l) => l.uuid === uuid)
            if (index !== -1) {
                lessons.value[index] = lesson
            }
            if (selectedLesson.value?.uuid === uuid) {
                selectedLesson.value = lesson
            }
            return lesson
        } catch (err: any) {
            error.value = err.message || 'Failed to add related action'
            console.error('Failed to add related action:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Remove related action from lesson
     */
    async function removeRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        lessonsLoading.value = true
        error.value = null

        try {
            const lesson = await lessonService.removeRelatedAction(uuid, actionId)
            const index = lessons.value.findIndex((l) => l.uuid === uuid)
            if (index !== -1) {
                lessons.value[index] = lesson
            }
            if (selectedLesson.value?.uuid === uuid) {
                selectedLesson.value = lesson
            }
            return lesson
        } catch (err: any) {
            error.value = err.message || 'Failed to remove related action'
            console.error('Failed to remove related action:', err)
            throw err
        } finally {
            lessonsLoading.value = false
        }
    }

    /**
     * Clear all errors
     */
    function clearError(): void {
        error.value = null
    }

    /**
     * Reset all state
     */
    function reset(): void {
        lessons.value = []
        selectedLesson.value = null
        lessonStats.value = null
        lessonsLoading.value = false
        lessonsTotal.value = 0
        lessonsPage.value = 1
        lessonsLimit.value = 10
        currentFilters.value = {}
        error.value = null
    }

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

        // Actions
        loadLessons,
        loadLessonById,
        loadLessonDetail,
        createLesson,
        updateLesson,
        deleteLesson,
        loadLessonStats,
        bulkUpdateLessons,
        addRelatedAction,
        removeRelatedAction,
        clearError,
        reset,
    }
})