<template>
  <div class="forgot-password-page">
    <div class="text-center q-mb-md">
      <q-icon name="lock_reset" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">{{ $t('auth.reset_password') }}</div>
      <div class="text-subtitle2 text-grey-6">
        {{ $t('auth.reset_password_instructions') }}
      </div>
    </div>

    <ForgotPasswordForm :loading="isLoading" :error-message="errorMessage" @send-reset="handleSendReset"
      @resend="handleResend" @open-email="openEmailApp" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { ForgotPasswordForm } from 'src/components/auth'

const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const { forgotPassword, isLoading } = useAuth()

// ============================================
// Local State
// ============================================
const errorMessage = ref('')
const emailSentTo = ref('')

// ============================================
// Computed
// ============================================

// ============================================
// Methods
// ============================================
async function handleSendReset(email: string): Promise<void> {
  errorMessage.value = ''
  emailSentTo.value = email

  try {
    await forgotPassword(email)

    $q.notify({
      type: 'positive',
      message: 'Password reset email sent! Check your inbox.',
      position: 'top',
    })
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to send reset email'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  }
}

async function handleResend(email: string): Promise<void> {
  await handleSendReset(email)
}

function openEmailApp(): void {
  window.location.href = 'mailto:'
}
</script>

<style lang="scss" scoped>
.forgot-password-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 8px 16px;

  @media (max-width: 400px) {
    padding: 8px 12px;
  }
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}
</style>