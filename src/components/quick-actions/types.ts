// src/components/quick-actions/types.ts

export interface QuickAction {
  id: string
  label: string
  icon: string
  color?: string
  outline?: boolean
  phase?: string
  tooltip?: string
  disabled?: boolean
  requiresOnline?: boolean
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
  confirmationType?: 'info' | 'success' | 'warning' | 'error' | 'delete'
  confirmLabel?: string
  successMessage?: string
  errorMessage?: string
  badge?: number | string
  permissions?: string[]
  action: () => void | Promise<void>
}

export interface QuickActionGroup {
  phase: string
  label: string
  icon: string
  actions: QuickAction[]
}

export const BCM_PHASES = {
  INITIATION: 'initiation',
  RISK: 'risk',
  STRATEGY: 'strategy',
  IMPLEMENTATION: 'implementation',
  TESTING: 'testing',
  INCIDENT: 'incident',
  MAINTENANCE: 'maintenance',
} as const

export const BCM_PHASE_LABELS: Record<string, string> = {
  initiation: 'Initiation',
  risk: 'Risk Assessment',
  strategy: 'Strategy Development',
  implementation: 'Implementation',
  testing: 'Testing & Exercises',
  incident: 'Incident Response',
  maintenance: 'Maintenance & Review',
}