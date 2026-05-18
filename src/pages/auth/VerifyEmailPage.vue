<template>
  <div class="verify-email-page">
    <div class="text-center">
      <q-icon
        :name="verified ? 'check_circle' : 'email'"
        :size="verified ? '80px' : '64px'"
        :color="verified ? 'green' : 'primary'"
      />

      <div v-if="verifying" class="q-mt-md">
        <q-spinner size="40px" color="primary" />
        <div class="text-h6 q-mt-sm">Verifying your email...</div>
      </div>

      <div v-else-if="verified" class="q-mt-md">
        <div class="text-h5 text-green">Email Verified!</div>
        <div class="text-subtitle1 q-mt-sm">Your email has been successfully verified.</div>
        <q-btn
          color="primary"
          label="Go to Login"
          class="q-mt-lg"
          :to="{ name: 'Login' }"
          unelevated
        />
      </div>

      <div v-else class="q-mt-md">
        <div class="text-h5 text-negative">Verification Failed</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ errorMessage || 'Unable to verify your email. The link may be expired or invalid.' }}
        </div>
        <q-btn
          flat
          color="primary"
          label="Request New Link"
          class="q-mt-lg"
          @click="resendVerification"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/api/auth/AuthService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const verifying = ref(true)
const verified = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    verifying.value = false
    errorMessage.value = 'No verification token provided'
    return
  }

  try {
    await authService.verifyEmail(token)
    verified.value = true
    $q.notify({
      type: 'positive',
      message: 'Email verified successfully!',
      position: 'top',
    })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Verification failed'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    verifying.value = false
  }
})

async function resendVerification() {
  try {
    await authService.resendVerificationEmail()
    $q.notify({
      type: 'positive',
      message: 'Verification email sent! Check your inbox.',
      position: 'top',
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Failed to resend verification',
      position: 'top',
    })
  }
}
</script>
