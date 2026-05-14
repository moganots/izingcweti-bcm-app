<!-- src/pages/auth/LoginPage.vue -->
<template>
  <q-page class="flex flex-center login-page">
    <div class="login-container">
      <!-- Left side - Branding -->
      <div class="login-branding gt-sm">
        <div class="branding-content">
          <q-icon name="shield" size="80px" color="white" />
          <h2 class="text-white q-mt-md">BCM System</h2>
          <p class="text-grey-4 text-subtitle1">Business Continuity Management Platform</p>
          <div class="features-list q-mt-xl">
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" />
              <span>Real-time Risk Monitoring</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" />
              <span>Incident Management</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" />
              <span>Compliance Tracking</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" size="20px" color="green-4" />
              <span>Offline-First Architecture</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <!-- Mobile Logo -->
          <div class="text-center lt-md q-mb-lg">
            <q-icon name="shield" size="50px" color="primary" />
            <h4 class="text-primary q-mt-sm q-mb-none">BCM System</h4>
          </div>

          <!-- Header -->
          <div class="text-center q-mb-lg">
            <h5 class="text-dark q-mb-xs">Welcome Back</h5>
            <p class="text-grey-6">Sign in to continue to your account</p>
          </div>

          <!-- Error Alert -->
          <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 q-mb-md rounded-borders" rounded>
            <template v-slot:avatar>
              <q-icon name="error_outline" color="red-8" />
            </template>
            {{ errorMessage }}
            <template v-slot:action>
              <q-btn flat color="red-8" label="Dismiss" @click="errorMessage = ''" />
            </template>
          </q-banner>

          <!-- Success Alert -->
          <q-banner
            v-if="successMessage"
            class="bg-green-1 text-green-8 q-mb-md rounded-borders"
            rounded
          >
            <template v-slot:avatar>
              <q-icon name="check_circle" color="green-8" />
            </template>
            {{ successMessage }}
          </q-banner>

          <!-- Login Form -->
          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <!-- Email Field -->
            <q-input
              v-model="form.email"
              label="Email Address"
              type="email"
              outlined
              dense
              lazy-rules
              :rules="emailRules"
              :disable="isLoading"
              autocomplete="email"
              autofocus
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <!-- Password Field -->
            <q-input
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="passwordRules"
              :disable="isLoading"
              autocomplete="current-password"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="togglePasswordVisibility"
                />
              </template>
            </q-input>

            <!-- Remember Me & Forgot Password -->
            <div class="row items-center justify-between">
              <q-checkbox
                v-model="form.rememberMe"
                label="Remember me"
                dense
                color="primary"
                :disable="isLoading"
              />
              <q-btn
                flat
                dense
                color="primary"
                label="Forgot Password?"
                no-caps
                :to="{ name: 'ForgotPassword' }"
                :disable="isLoading"
              />
            </div>

            <!-- Submit Button -->
            <q-btn
              type="submit"
              color="primary"
              label="Sign In"
              :loading="isLoading"
              class="full-width q-py-sm"
              size="lg"
              unelevated
            >
              <template v-slot:loading>
                <q-spinner-hourglass />
                Signing in...
              </template>
            </q-btn>

            <!-- Biometric Login (Mobile Only) -->
            <q-btn
              v-if="isBiometricAvailable"
              outline
              color="primary"
              icon="fingerprint"
              label="Sign in with Biometrics"
              class="full-width q-mt-sm"
              :disable="isLoading"
              @click="handleBiometricLogin"
            />
          </q-form>

          <!-- Server Status -->
          <div class="text-center q-mt-lg">
            <q-badge
              :color="serverStatus.online ? 'green' : 'red'"
              :label="serverStatus.online ? 'Server Online' : 'Server Offline'"
              class="q-px-md q-py-xs"
            />
          </div>

          <!-- App Version -->
          <div class="text-center q-mt-md">
            <p class="text-grey-5 text-caption">BCM Mobile v{{ appVersion }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Network Status -->
    <OfflineBanner v-if="isOffline" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth.store'
import { useUiStore } from '../../stores/ui.store'
import { useNetwork } from '../../composables/useNetwork'
import { Device } from '@capacitor/device'
import OfflineBanner from '../../components/common/OfflineBanner.vue'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const authStore = useAuthStore()
const uiStore = useUiStore()

// Composables
const { isOnline } = useNetwork()
const $q = useQuasar()

// Reactive state
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isBiometricAvailable = ref(false)
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0')

// Computed
const isOffline = computed(() => !isOnline.value)

const serverStatus = reactive({
  online: true,
  lastChecked: new Date(),
})

// Validation rules
const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(val) || 'Please enter a valid email address'
  },
]

const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 6 || 'Password must be at least 6 characters',
]

// Lifecycle
onMounted(async () => {
  // Check for redirect message (e.g., after password reset)
  if (route.query.message) {
    successMessage.value = route.query.message as string
  }

  // Check if user was redirected from another page
  if (route.query.redirect) {
    errorMessage.value = 'Please sign in to access that page.'
  }

  // Load saved email if "Remember me" was checked
  const savedEmail = localStorage.getItem('bcm_remembered_email')
  if (savedEmail) {
    form.email = savedEmail
    form.rememberMe = true
  }

  // Check biometric availability
  await checkBiometricAvailability()

  // Check server status
  await checkServerStatus()
})

// Methods
function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}

async function handleLogin(): Promise<void> {
  // Validate form
  if (!form.email || !form.password) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }

  if (!isOnline.value) {
    errorMessage.value = 'Cannot sign in while offline. Please check your connection.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Attempt login
    await authStore.login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    // Save email if "Remember me" is checked
    if (form.rememberMe) {
      localStorage.setItem('bcm_remembered_email', form.email)
    } else {
      localStorage.removeItem('bcm_remembered_email')
    }

    // Success notification
    $q.notify({
      type: 'positive',
      message: `Welcome back, ${authStore.user?.firstName || 'User'}!`,
      position: 'top',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }],
    })

    // Redirect to intended page or dashboard
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (error: any) {
    console.error('Login failed:', error)

    if (error.response?.status === 401) {
      errorMessage.value = 'Invalid email or password. Please try again.'
    } else if (error.response?.status === 403) {
      errorMessage.value = 'Your account has been deactivated. Contact your administrator.'
    } else if (error.response?.status === 429) {
      errorMessage.value = 'Too many login attempts. Please try again later.'
    } else if (!error.response) {
      errorMessage.value = 'Network error. Please check your connection.'
      serverStatus.online = false
    } else {
      errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.'
    }

    // Shake animation for error
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
      timeout: 5000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  } finally {
    isLoading.value = false
  }
}

async function handleBiometricLogin(): Promise<void> {
  try {
    // This would integrate with platform-specific biometric authentication
    $q.notify({
      type: 'info',
      message: 'Biometric authentication initiated...',
      position: 'top',
      timeout: 2000,
    })

    // Placeholder for biometric auth logic
    console.log('Biometric login attempted')
  } catch (error) {
    console.error('Biometric login failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Biometric authentication failed. Please use password.',
      position: 'top',
    })
  }
}

async function checkBiometricAvailability(): Promise<void> {
  try {
    const info = await Device.getInfo()
    isBiometricAvailable.value = info.platform === 'ios' || info.platform === 'android'
  } catch (error) {
    isBiometricAvailable.value = false
  }
}

async function checkServerStatus(): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/ping`)
    serverStatus.online = response.ok
    serverStatus.lastChecked = new Date()
  } catch {
    serverStatus.online = false
    serverStatus.lastChecked = new Date()
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-container {
    display: flex;
    width: 100%;
    max-width: 1000px;
    min-height: 600px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .login-branding {
    flex: 1;
    background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .branding-content {
      max-width: 350px;
    }

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

  .login-form-container {
    flex: 1;
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-form-wrapper {
      width: 100%;
      max-width: 400px;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .login-page {
    background: white;
    padding: 20px;

    .login-container {
      flex-direction: column;
      border-radius: 0;
      box-shadow: none;
      min-height: auto;
    }

    .login-form-container {
      padding: 40px 20px;
    }
  }
}
</style>
