import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../../models/user/user.entity'
import { UserRole } from '../../models/user/user.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'

export const useUserItemStore = createOfflineCrudStore<User>({
  storeId: 'users',
  tableName: 'users',
})

export const useUserStore = defineStore('user', () => {
  const userStore = useUserItemStore()
  const isSaving = ref(false)

  const users = userStore.items

  // ============================================
  // Getters
  // ============================================
  const activeUsers = computed(() => users?.filter((u) => u.isActive))
  const inactiveUsers = computed(() => users?.filter((u) => !u.isActive))

  const trainingCompleted = computed(() =>
    users?.filter((u) => u.trainingCompletedAt)
  )

  const trainingPending = computed(() =>
    users?.filter((u) => u.isActive && !u.trainingCompletedAt)
  )

  const lockedUsers = computed(() =>
    users?.filter(
      (u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()
    )
  )

  const usersByRole = computed(() => {
    const grouped: Record<string, User[]> = {}
    users?.forEach((u) => {
      const role = u.role || 'Unknown'
      if (!grouped[role]) grouped[role] = []
      grouped[role].push(u)
    })
    return grouped
  })

  const usersByOrganisation = computed(() => {
    const grouped: Record<string, User[]> = {}
    users?.forEach((u) => {
      const orgId = u.organisationId || 'Unknown'
      if (!grouped[orgId]) grouped[orgId] = []
      grouped[orgId].push(u)
    })
    return grouped
  })

  const managers = computed(() =>
    users?.filter((u) => u.directReports && u.directReports.length > 0)
  )

  const userRoles = computed(() => {
    return [...new Set(users?.map((u) => u.role))].filter(Boolean)
  })

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await userStore.initialize()
  }

  async function activateUser(id: string): Promise<User | null> {
    return userStore.update(id, { isActive: true } as Partial<User>)
  }

  async function deactivateUser(id: string): Promise<User | null> {
    return userStore.update(id, { isActive: false } as Partial<User>)
  }

  async function lockUserAccount(
    id: string,
    lockedUntil: Date,
    reason: string
  ): Promise<User | null> {
    return userStore.update(id, {
      lockedUntil,
      lockedAt: new Date(),
      lockReason: reason,
    } as Partial<User>)
  }

  async function unlockUserAccount(id: string): Promise<User | null> {
    return userStore.update(id, {
      lockedUntil: undefined,
      lockedAt: undefined,
      lockReason: undefined,
      failedLoginAttempts: 0,
    } as unknown as Partial<User>)
  }

  async function updateTrainingStatus(id: string, completed: boolean): Promise<User | null> {
    return userStore.update(id, {
      trainingCompletedAt: completed ? new Date() : undefined,
    } as Partial<User>)
  }

  async function changeUserRole(id: string, role: UserRole): Promise<User | null> {
    return userStore.update(id, { role } as Partial<User>)
  }

  return {
    // State
    users,
    selectedUser: userStore.selected,
    isLoading: userStore.loading,
    isSaving,
    error: userStore.error,

    // Getters
    activeUsers,
    inactiveUsers,
    trainingCompleted,
    trainingPending,
    lockedUsers,
    usersByRole,
    usersByOrganisation,
    managers,
    userRoles,

    // Actions
    initialize,
    activateUser,
    deactivateUser,
    lockUserAccount,
    unlockUserAccount,
    updateTrainingStatus,
    changeUserRole,

    // Sub-store
    userStore,
  }
})