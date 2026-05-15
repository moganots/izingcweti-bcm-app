<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="forgot-password-card q-pa-lg" style="width: 450px; max-width: 90vw">
      <q-card-section class="text-center">
        <q-icon name="lock_reset" size="60px" color="primary" />
        <h5 class="text-dark q-mt-md q-mb-xs">Forgot Password?</h5>
        <p class="text-grey-7">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </q-card-section>

      <!-- Step 1: Email Input -->
      <q-card-section v-if="step === 1">
        <q-form @submit.prevent="handleSendReset" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email Address"
            type="email"
            outlined
            dense
            lazy-rules
            :rules="emailRules"
            :disable="loading"
            autocomplete="email"
            autofocus
            clearable
          >
            <template v-slot:prepend><q-icon name="email" color="primary" /></template>
          </q-input>
          <q-btn
            type="submit"
            color="primary"
            label="Send Reset Link"
            :loading="loading"
            class="full-width q-py-sm"
            size="lg"
            unelevated
          />
          <div class="text-center">
            <q-btn
              flat
              color="primary"
              label="Back to Login"
              icon="arrow_back"
              :to="{ name: 'Login' }"
              :disable="loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Step 2: Success -->
      <q-card-section v-if="step === 2" class="text-center">
        <q-icon name="check_circle" size="80px" color="green" />
        <h6 class="text-green q-mt-md q-mb-xs">Email Sent!</h6>
        <p class="text-grey-7 q-mb-lg">
          We've sent password reset instructions to <strong>{{ email }}</strong>
        </p>
        <p class="text-grey-6 text-caption">
          Check your inbox and spam folder. The link expires in 30 minutes.
        </p>
        <q-btn
          color="primary"
          label="Open Email App"
          icon="email"
          class="full-width q-mt-lg"
          unelevated
          @click="openEmailApp"
        />
        <q-btn
          outline
          color="primary"
          label="Resend Email"
          icon="refresh"
          class="full-width q-mt-sm"
          :loading="loading"
          @click="handleResend"
        />
        <q-btn flat color="grey-7" label="Back to Login" :to="{ name: 'Login' }" class="q-mt-sm" />
      </q-card-section>

      <!-- Step 3: Error -->
      <q-card-section v-if="step === 3" class="text-center">
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

      <q-separator v-if="step !== 2" class="q-my-md" />
      <q-card-section v-if="step !== 2" class="text-center">
        <p class="text-grey-6 text-caption q-mb-none">
          Need help? Contact
          <a href="mailto:support@izingcweti-bcm.com" class="text-primary"
            >support@izingcweti-bcm.com</a
          >
        </p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from '../../services/api/AuthService'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const step = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email',
]

async function handleSendReset(): Promise<void> {
  if (!email.value) return
  loading.value = true
  try {
    await authService.forgotPassword({ email: email.value })
    step.value = 2
    $q.notify({ type: 'positive', message: 'Reset email sent!', position: 'top' })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to send reset email'
    step.value = 3
  } finally {
    loading.value = false
  }
}

async function handleResend(): Promise<void> {
  loading.value = true
  try {
    await authService.forgotPassword({ email: email.value })
    $q.notify({ type: 'positive', message: 'Reset email resent!', position: 'top' })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'Failed to resend', position: 'top' })
  } finally {
    loading.value = false
  }
}

function openEmailApp(): void {
  window.open('mailto:', '_blank')
}
function resetForm(): void {
  email.value = ''
  step.value = 1
  errorMessage.value = ''
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
