<!-- src/pages/auth/ForgotPasswordPage.vue -->
<template>
  <div class="forgot-password-page">
    <div class="text-center q-mb-md">
      <q-icon name="lock_reset" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">Reset Password</div>
      <div class="text-subtitle2 text-grey-6">
        We'll send you instructions to reset your password
      </div>
    </div>

    <ForgotPasswordForm
      :loading="loading"
      :error-message="errorMessage"
      @send-reset="handleSendReset"
      @resend="handleResend"
      @open-email="openEmailApp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/api/auth/AuthService'
import { ForgotPasswordForm } from 'src/components/auth'

const $q = useQuasar()
const loading = ref(false)
const errorMessage = ref('')

async function handleSendReset(email: string) {
  loading.value = true
  errorMessage.value = ''

  try {
    await authService.forgotPassword({ email })
    $q.notify({
      type: 'positive',
      message: 'Password reset email sent! Check your inbox.',
      position: 'top',
    })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to send reset email'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

async function handleResend(email: string) {
  await handleSendReset(email)
}

function openEmailApp() {
  // Try to open email app
  window.location.href = 'mailto:'
}
</script>