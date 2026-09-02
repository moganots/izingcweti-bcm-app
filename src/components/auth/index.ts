// ============================================================
//  Authentication Components - Barrel Export
//  All auth-related components should be exported from here
// ============================================================

// ----- Forms -----
export { default as LoginForm } from './LoginForm.vue'
export { default as RegisterForm } from './RegisterForm.vue'
export { default as ForgotPasswordForm } from './ForgotPasswordForm.vue'
export { default as ChangePasswordForm } from './ChangePasswordForm.vue'

// ----- Profile & Sessions -----
export { default as ProfileCard } from './ProfileCard.vue'
export { default as SessionList } from './SessionList.vue'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for auth components
// ============================================================

// export type { 
//   LoginCredentials, 
//   RegisterData, 
//   PasswordChangeData,
//   UserProfile,
//   Session 
// } from './types'

// ============================================================
//  Constants Exports (Optional)
//  Export shared validation rules or constants
// ============================================================

// export { 
//   PASSWORD_RULES, 
//   EMAIL_RULES,
//   MIN_PASSWORD_LENGTH,
//   MAX_PASSWORD_LENGTH 
// } from './constants'