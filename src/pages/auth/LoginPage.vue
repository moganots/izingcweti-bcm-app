<template>
  <div class="login-page">
    <div class="text-center q-mb-md">
      <q-icon name="lock" size="30px" color="primary" />
      <div class="text-h5 q-mt-sm">Welcome Back</div>
      <div class="text-subtitle2 text-grey-6">Sign in to your account</div>
    </div>

    <LoginForm
      :loading="loading"
      :error-message="errorMessage"
      :biometric-available="biometricAvailable"
      :saved-email="savedEmail"
      @submit="handleLogin"
      @biometric-login="handleBiometricLogin"
      @clear-error="clearError"
    />

    <div class="text-center q-mt-md">
      <q-btn
        flat
        dense
        color="primary"
        label="Don't have an account? Sign up"
        :to="{ name: 'Register' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'
import { LoginForm } from 'src/components/auth'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const biometricAvailable = ref(false)
const savedEmail = ref('')

onMounted(() => {
  // Check for saved email
  savedEmail.value = localStorage.getItem('bcm_remembered_email') || ''
  
  // Check biometric availability
  checkBiometricAvailability()
})

async function handleLogin(credentials: { email: string; password: string; rememberMe: boolean }) {
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.login({
      email: credentials.email,
      password: credentials.password,
      remember_me: credentials.rememberMe,
    })
    
    $q.notify({
      type: 'positive',
      message: 'Login successful! Redirecting...',
      position: 'top',
    })
    
    router.push({ name: 'Dashboard' })
  } catch (err: any) {
    errorMessage.value = err.message || 'Invalid email or password'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

async function checkBiometricAvailability() {
  if (window.PublicKeyCredential && await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()) {
    biometricAvailable.value = true
  }
}

async function handleBiometricLogin() {
  // Implement WebAuthn biometric login
  $q.notify({
    type: 'info',
    message: 'Biometric login feature coming soon',
    position: 'top',
  })
}

function clearError() {
  errorMessage.value = ''
}
</script>