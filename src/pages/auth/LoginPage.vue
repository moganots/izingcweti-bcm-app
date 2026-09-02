<template>
  <div class="login-page">
    <div class="text-center q-mb-md">
      <q-icon name="lock" size="30px" color="primary" />
      <div class="text-h5 q-mt-sm">{{ $t('auth.welcomeBack') }}</div>
      <div class="text-subtitle2 text-grey-6">{{ $t('auth.signInToContinue') }}</div>
    </div>

    <LoginForm :loading="isLoading" :error-message="authError || ''" :biometric-available="biometricAvailable"
      :saved-email="savedEmail" @submit="handleLogin" @biometric-login="handleBiometricLogin"
      @clear-error="clearError" />

    <div class="text-center q-mt-md">
      <q-btn flat dense color="primary" :label="$t('auth.dontHaveAccount')" :to="{ name: 'Register' }" no-caps />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { LoginForm } from 'src/components/auth'
import { LoginCredentials } from 'src/models/entities/user/user.entity'

const router = useRouter()
const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const { login, isLoading, error: authError } = useAuth()

// ============================================
// Local State
// ============================================
const biometricAvailable = ref(false)
const savedEmail = ref('')

// ============================================
// Computed
// ============================================

// ============================================
// Methods
// ============================================
async function handleLogin(credentials: LoginCredentials): Promise<void> {
  try {
    await login(credentials.email, credentials.password, credentials.rememberMe)

    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top',
    })

    router.push({ name: 'Dashboard' })
  } catch (err: any) {
    // Error is handled by useAuth
    $q.notify({
      type: 'negative',
      message: err.message || 'Invalid email or password',
      position: 'top',
    })
  }
}

function clearError(): void {
  // Error will be cleared by useAuth
}

async function handleBiometricLogin(): Promise<void> {
  $q.notify({
    type: 'info',
    message: 'Biometric login feature coming soon',
    position: 'top',
  })
}

function checkBiometricAvailability(): void {
  if (window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(available => {
        biometricAvailable.value = available
      })
      .catch(() => {
        biometricAvailable.value = false
      })
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  savedEmail.value = localStorage.getItem('bcm_remembered_email') || ''
  checkBiometricAvailability()
})
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 8px 16px;

  @media (max-width: 400px) {
    padding: 8px 12px;
  }
}

:deep(.login-form) {
  .login-form__field {
    margin-bottom: 16px;

    @media (max-width: 400px) {
      margin-bottom: 12px;
    }
  }

  .login-form__row--between {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    @media (max-width: 400px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }

  .login-form__submit-btn {
    min-height: 44px;
    font-size: 0.9375rem;

    @media (max-width: 400px) {
      min-height: 40px;
      font-size: 0.875rem;
    }
  }
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}
</style>