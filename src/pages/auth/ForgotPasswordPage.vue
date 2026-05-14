<!-- src/pages/auth/ForgotPasswordPage.vue -->
<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="forgot-password-card q-pa-lg" style="width: 450px; max-width: 90vw">
      <!-- Header -->
      <q-card-section class="text-center">
        <q-icon name="lock_reset" size="60px" color="primary" />
        <h5 class="text-dark q-mt-md q-mb-xs">Forgot Password?</h5>
        <p class="text-grey-7">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </q-card-section>

      <!-- Step 1: Email Input -->
      <q-card-section v-if="currentStep === 1">
        <q-form @submit.prevent="handleSendResetLink" class="q-gutter-md">
          <q-input
            v-model="email"
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

          <q-btn
            type="submit"
            color="primary"
            label="Send Reset Link"
            :loading="isLoading"
            class="full-width q-py-sm"
            size="lg"
            unelevated
          >
            <template v-slot:loading>
              <q-spinner-hourglass />
              Sending...
            </template>
          </q-btn>

          <div class="text-center">
            <q-btn
              flat
              color="primary"
              label="Back to Login"
              icon="arrow_back"
              :to="{ name: 'Login' }"
              :disable="isLoading"
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Step 2: Success Message -->
      <q-card-section v-if="currentStep === 2" class="text-center">
        <q-icon name="check_circle" size="80px" color="green" />
        <h6 class="text-green q-mt-md q-mb-xs">Email Sent!</h6>
        <p class="text-grey-7 q-mb-lg">
          We've sent password reset instructions to
          <strong>{{ email }}</strong>
        </p>
        <p class="text-grey-6 text-caption">
          Please check your inbox and spam folder. The link will expire in 30 minutes.
        </p>

        <div class="q-gutter-md q-mt-lg">
          <q-btn
            color="primary"
            label="Open Email App"
            icon="email"
            class="full-width"
            unelevated
            @click="openEmailApp"
          />
          <q-btn
            outline
            color="primary"
            label="Resend Email"
            icon="refresh"
            class="full-width"
            :loading="isLoading"
            :disable="resendCooldown > 0"
            @click="handleResendEmail"
          >
            <template v-if="resendCooldown > 0"> Resend in {{ resendCooldown }}s </template>
          </q-btn>
          <q-btn flat color="grey-7" label="Back to Login" :to="{ name: 'Login' }" />
        </div>
      </q-card-section>

      <!-- Step 3: Error State -->
      <q-card-section v-if="currentStep === 3" class="text-center">
        <q-icon name="error_outline" size="80px" color="red" />
        <h6 class="text-red q-mt-md q-mb-xs">Error</h6>
        <p class="text-grey-7 q-mb-lg">{{ errorMessage }}</p>

        <q-btn
          color="primary"
          label="Try Again"
          icon="refresh"
          class="full-width"
          unelevated
          @click="resetForm"
        />
        <q-btn
          flat
          color="grey-7"
          label="Back to Login"
          class="full-width q-mt-sm"
          :to="{ name: 'Login' }"
        />
      </q-card-section>

      <!-- Help Section -->
      <q-separator v-if="currentStep !== 2" class="q-my-md" />
      <q-card-section v-if="currentStep !== 2" class="text-center">
        <p class="text-grey-6 text-caption q-mb-none">
          Need help? Contact
          <a href="mailto:support@bcm-system.com" class="text-primary"> support@bcm-system.com </a>
        </p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { AuthService } from '../../services/api/AuthService'
import { AppLauncher } from '@capacitor/app-launcher'

// Router
const router = useRouter()
const $q = useQuasar()

// Reactive state
const email = ref('')
const currentStep = ref(1) // 1: form, 2: success, 3: error
const isLoading = ref(false)
const errorMessage = ref('')
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

// Validation rules
const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(val) || 'Please enter a valid email address'
  },
]

// Cleanup
onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

// Methods
async function handleSendResetLink(): Promise<void> {
  if (!email.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await AuthService.forgotPassword({ email: email.value.trim().toLowerCase() })

    currentStep.value = 2

    $q.notify({
      type: 'positive',
      message: 'Password reset email sent successfully!',
      position: 'top',
    })
  } catch (error: any) {
    console.error('Forgot password failed:', error)

    if (error.response?.status === 404) {
      // Don't reveal if email exists for security, but show success anyway
      currentStep.value = 2
    } else if (error.response?.status === 429) {
      errorMessage.value = 'Too many requests. Please try again later.'
      currentStep.value = 3
    } else {
      errorMessage.value =
        error.response?.data?.message || 'Failed to send reset email. Please try again.'
      currentStep.value = 3
    }
  } finally {
    isLoading.value = false
  }
}

async function handleResendEmail(): Promise<void> {
  if (resendCooldown.value > 0) return

  isLoading.value = true

  try {
    await AuthService.forgotPassword({ email: email.value })

    // Start cooldown
    resendCooldown.value = 60
    cooldownTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
      }
    }, 1000)

    $q.notify({
      type: 'positive',
      message: 'Reset email resent successfully!',
      position: 'top',
    })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Failed to resend email. Please try again.',
      position: 'top',
    })
  } finally {
    isLoading.value = false
  }
}

async function openEmailApp(): Promise<void> {
  try {
    // Try to open default email app
    await AppLauncher.openUrl({ url: 'mailto:' })
  } catch {
    // Fallback: open mailto link
    window.open('mailto:', '_blank')
  }
}

function resetForm(): void {
  email.value = ''
  currentStep.value = 1
  errorMessage.value = ''
  isLoading.value = false
}
</script>

<style lang="scss" scoped>
.forgot-password-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .forgot-password-card {
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
