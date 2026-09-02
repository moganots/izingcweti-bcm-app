import { boot } from 'quasar/wrappers'
import { UserRole } from './../models/entities'
import { useAuthStore } from './../stores'

/**
 * Permissions Boot File
 * Provides permission checking utilities
 */
export default boot(({ app }) => {
  const authStore = useAuthStore()

  // Permission checking utilities
  const permissions = {
    /**
     * Check if user has a specific role
     */
    hasRole(role: UserRole | UserRole[]): boolean {
      if (!authStore.user) return false
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(authStore.user.role as UserRole)
    },

    /**
     * Check if user is an admin
     */
    isAdmin(): boolean {
      return permissions.hasRole([UserRole.SYSTEM_ADMINISTRATOR, UserRole.SUPER_ADMIN])
    },

    /**
     * Check if user can manage BCM
     */
    canManageBCM(): boolean {
      return permissions.hasRole([
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ])
    },

    /**
     * Check if user can manage risks
     */
    canManageRisks(): boolean {
      return permissions.hasRole([
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ])
    },

    /**
     * Check if user can approve
     */
    canApprove(): boolean {
      return permissions.hasRole([
        UserRole.APPROVER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ])
    },

    /**
     * Check if user can audit
     */
    canAudit(): boolean {
      return permissions.hasRole([
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ])
    },

    /**
     * Check if user can manage incidents
     */
    canManageIncidents(): boolean {
      return permissions.hasRole([
        UserRole.BCM_MANAGER,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ])
    },
  }

  // Provide permissions globally
  app.config.globalProperties.$permissions = permissions
  app.provide('permissions', permissions)
})
