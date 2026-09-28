import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LessonEntity } from '../../models/improvements/lesson.entity'
import { LessonStatus, LessonPriority } from '../../models/improvements/lesson.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'

export const useLessonItemStore = createOfflineCrudStore<LessonEntity>({
    storeId: 'lessons',
    tableName: 'lessons',
})

export const useLessonStore = defineStore('lesson', () => {
    const lessonStore = useLessonItemStore()
    const isSaving = ref(false)

    const lessons = lessonStore.items

    // ============================================
    // Getters
    // ============================================
    const draftLessons = computed(() =>
        lessons?.filter((l) => l.status === LessonStatus.DRAFT)
    )

    const underReviewLessons = computed(() =>
        lessons?.filter((l) => l.status === LessonStatus.UNDER_REVIEW)
    )

    const implementedLessons = computed(() =>
        lessons?.filter((l) => l.status === LessonStatus.IMPLEMENTED)
    )

    const closedLessons = computed(() =>
        lessons?.filter((l) => l.status === LessonStatus.CLOSED)
    )

    const rejectedLessons = computed(() =>
        lessons?.filter((l) => l.status === LessonStatus.REJECTED)
    )

    const criticalPriorityLessons = computed(() =>
        lessons?.filter((l) => l.priority === LessonPriority.CRITICAL)
    )

    const highPriorityLessons = computed(() =>
        lessons?.filter((l) => l.priority === LessonPriority.HIGH)
    )

    const lessonsWithActions = computed(() =>
        lessons?.filter((l) => l.relatedActions && l.relatedActions.length > 0)
    )

    const implementationRate = computed(() => {
        if (lessons?.length === 0) return 0
        return Math.round((implementedLessons?.value?.length / lessons?.length) * 100)
    })

    const averageEffectiveness = computed(() => {
        const rated = lessons?.filter((l) => l.effectivenessRating)
        if (rated.length === 0) return 0
        const sum = rated.reduce((acc, l) => acc + (l.effectivenessRating || 0), 0)
        return Math.round((sum / rated.length) * 10) / 10
    })

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        await lessonStore.initialize()
    }

    async function addRelatedAction(lessonId: string, actionId: string): Promise<LessonEntity | null> {
        const lesson = lessons?.find((l) => l.uuid === lessonId)
        if (!lesson) return null

        const currentActions = lesson.relatedActions || []
        if (currentActions.includes(actionId)) return lesson

        return lessonStore.update(lessonId, {
            relatedActions: [...currentActions, actionId],
        } as Partial<LessonEntity>)
    }

    async function removeRelatedAction(lessonId: string, actionId: string): Promise<LessonEntity | null> {
        const lesson = lessons?.find((l) => l.uuid === lessonId)
        if (!lesson) return null

        const currentActions = lesson.relatedActions || []
        return lessonStore.update(lessonId, {
            relatedActions: currentActions.filter((a) => a !== actionId),
        } as Partial<LessonEntity>)
    }

    return {
        // State
        lessons,
        selectedLesson: lessonStore.selected,
        isLoading: lessonStore.loading,
        isSaving,
        error: lessonStore.error,

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
        addRelatedAction,
        removeRelatedAction,

        // Sub-store
        lessonStore,
    }
})