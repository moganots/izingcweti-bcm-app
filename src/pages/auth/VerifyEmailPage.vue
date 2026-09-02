<template>
  <div class="verify-email-page">
    <div class="text-center">
      <q-icon :name="verified ? 'check_circle' : 'email'" :size="verified ? '80px' : '64px'"
        :color="verified ? 'green' : 'primary'" />

      <div v-if="verifying" class="q-mt-md">
        <q-spinner size="40px" color="primary" />
        <div class="text-h6 q-mt-sm">{{ $t('auth.verifying_email') }}</div>
      </div>

      <div v-else-if="verified" class="q-mt-md">
        <div class="text-h5 text-green">{{ $t('auth.email_verified') }}</div>
        <div class="text-subtitle1 q-mt-sm">{{ $t('auth.email_verified_message') }}</div>
        <q-btn color="primary" :label="$t('auth.go_to_login')" class="q-mt-lg" :to="{ name: 'Login' }" unelevated />
      </div>

      <div v-else class="q-mt-md">
        <div class="text-h5 text-negative">{{ $t('auth.verification_failed') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ errorMessage || $t('auth.verification_failed_message') }}
        </div>
        <q-btn flat color="primary" :label="$t('auth.request_new_link')" class="q-mt-lg" :loading="resending"
          @click="resendVerification" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useApi } from 'src/composables/useApi'

const route = useRoute()
const $q = useQuasar()

// ============================================
// API Composable
// ============================================
const { post } = useApi()

// ============================================
// Local State
// ============================================
const verifying = ref(true)
const verified = ref(false)
const errorMessage = ref('')
const resending = ref(false)

// ============================================
// Methods
// ============================================
async function verifyEmail(token: string): Promise<void> {
  try {
    await post('/auth/verify-email', { token })
    verified.value = true
    $q.notify({
      type: 'positive',
      message: 'Email verified successfully!',
      position: 'top',
    })
  } catch (err: any) {
    errorMessage.value = err.message || 'Verification failed'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    verifying.value = false
  }
}

async function resendVerification(): Promise<void> {
  resending.value = true
  try {
    await post('/auth/resend-verification')
    $q.notify({
      type: 'positive',
      message: 'Verification email sent! Check your inbox.',
      position: 'top',
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to resend verification',
      position: 'top',
    })
  } finally {
    resending.value = false
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  const token = route.query.token as string
  if (!token) {
    verifying.value = false
    errorMessage.value = 'No verification token provided'
    return
  }
  verifyEmail(token)
})
</script>

<style lang="scss" scoped>
.verify-email-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;

  @media (max-width: 400px) {
    padding: 12px;
  }
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}

.text-h6 {
  font-size: 1.125rem;

  @media (max-width: 400px) {
    font-size: 1rem;
  }
}
</style>