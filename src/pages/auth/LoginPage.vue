<template>
  <q-page class="auth-page flex flex-center">
    <div class="auth-container">
      <!-- Branding -->
      <div class="auth-branding gt-sm">
        <div class="branding-content">
          <q-icon name="shield" size="80px" color="white" />
          <h2 class="text-white q-mt-md">Izingcweti BCM</h2>
          <p class="text-grey-4 text-subtitle1">Business Continuity Management Platform</p>
          <div class="features-list q-mt-xl">
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" /><span
                >Real-time Risk Monitoring</span
              >
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" /><span
                >Incident Management</span
              >
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" /><span
                >Compliance Tracking</span
              >
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" /><span
                >Offline-First Architecture</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <div class="auth-form-container">
        <div class="auth-form-wrapper">
          <div class="text-center lt-md q-mb-lg">
            <q-icon name="shield" size="50px" color="primary" />
            <h4 class="text-primary q-mt-sm q-mb-none">Izingcweti BCM</h4>
          </div>

          <div class="text-center q-mb-lg">
            <h5 class="text-dark q-mb-xs">Welcome Back</h5>
            <p class="text-grey-6">Sign in to continue to your account</p>
          </div>

          <LoginForm
            :loading="authStore.isLoading"
            :error-message="authStore.error || ''"
            :biometric-available="biometricAvailable"
            :saved-email="savedEmail"
            @submit="handleLogin"
            @biometric-login="handleBiometricLogin"
            @clear-error="authStore.error = null"
          />

          <div class="text-center q-mt-lg">
            <q-badge
              :color="serverOnline ? 'green' : 'red'"
              :label="serverOnline ? 'Server Online' : 'Server Offline'"
              class="q-px-md q-py-xs"
            />
          </div>

          <div class="text-center q-mt-md">
            <p class="text-grey-5 text-caption">Izingcweti BCM v{{ appVersion }}</p>
          </div>
        </div>
      </div>
    </div>

    <OfflineBanner v-if="isOffline" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth.store'
import { useUiStore } from '../../stores/ui.store'
import { useNetwork } from '../../composables/useNetwork'
import { Device } from '@capacitor/device'
import LoginForm from '../../components/auth/LoginForm.vue'
import OfflineBanner from '../../components/.common/OfflineBanner.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { isOnline } = useNetwork()

const biometricAvailable = ref(false)
const serverOnline = ref(true)
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0')
const savedEmail = ref('')

const isOffline = computed(() => !isOnline.value)

onMounted(async () => {
  // Check for redirect message
  if (route.query.message) {
    $q.notify({ type: 'positive', message: route.query.message as string, position: 'top' })
  }

  // Load saved email
  const remembered = localStorage.getItem('bcm_remembered_email')
  if (remembered) savedEmail.value = remembered

  // Check biometric availability
  try {
    const info = await Device.getInfo()
    biometricAvailable.value = info.platform === 'ios' || info.platform === 'android'
  } catch {
    biometricAvailable.value = false
  }

  // Check server status
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ping`)
    serverOnline.value = response.ok
  } catch {
    serverOnline.value = false
  }
})

async function handleLogin(data: {
  email: string
  password: string
  rememberMe: boolean
}): Promise<void> {
  if (!isOnline.value) {
    $q.notify({ type: 'warning', message: 'Cannot sign in while offline', position: 'top' })
    return
  }

  try {
    await authStore.login({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      remember_me: data.rememberMe,
    })
    $q.notify({ type: 'positive', message: 'Welcome back!', position: 'top' })
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Login failed',
      position: 'top',
      timeout: 5000,
    })
  }
}

async function handleBiometricLogin(): Promise<void> {
  $q.notify({
    type: 'info',
    message: 'Biometric authentication initiated...',
    position: 'top',
    timeout: 2000,
  })
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  padding: 20px;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.auth-branding {
  flex: 1;
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .features-list {
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      color: white;
      font-size: 15px;
    }
  }
}

.auth-form-container {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .auth-form-wrapper {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .auth-page {
    background: white;
    padding: 20px;
  }
  .auth-container {
    flex-direction: column;
    border-radius: 0;
    box-shadow: none;
    min-height: auto;
  }
  .auth-form-container {
    padding: 40px 20px;
  }
}
</style>
