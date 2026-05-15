<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="reset-password-card q-pa-lg" style="width: 450px; max-width: 90vw">
      <!-- Loading State -->
      <div v-if="isVerifying" class="text-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
        <p class="text-grey-7 q-mt-md">Verifying reset token...</p>
      </div>

      <!-- Invalid Token -->
      <div v-else-if="tokenInvalid" class="text-center">
        <q-icon name="error_outline" size="80px" color="red" />
        <h5 class="text-red q-mt-md q-mb-xs">Invalid or Expired Link</h5>
        <p class="text-grey-7 q-mb-lg">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <q-btn
          color="primary"
          label="Request New Reset Link"
          icon="refresh"
          class="full-width"
          unelevated
          @click="$router.push({ name: 'ForgotPassword' })"
        />
        <q-btn
          flat
          color="grey-7"
          label="Back to Login"
          class="full-width q-mt-sm"
          :to="{ name: 'Login' }"
        />
      </div>

      <!-- Reset Form -->
      <template v-else>
        <!-- Header -->
        <q-card-section class="text-center">
          <q-icon name="lock_reset" size="60px" color="primary" />
          <h5 class="text-dark q-mt-md q-mb-xs">Reset Password</h5>
          <p class="text-grey-7">Enter your new password below.</p>
          <p v-if="userEmail" class="text-caption text-grey-6">
            Resetting password for <strong>{{ userEmail }}</strong>
          </p>
        </q-card-section>

        <!-- Form -->
        <q-card-section>
          <q-form @submit.prevent="handleReset" class="q-gutter-md">
            <!-- New Password -->
            <q-input
              v-model="form.newPassword"
              label="New Password"
              :type="showNewPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="passwordRules"
              :disable="loading"
              autocomplete="new-password"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showNewPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </q-input>

            <!-- Confirm Password -->
            <q-input
              v-model="form.confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="[requiredRule, confirmPasswordRule]"
              :disable="loading"
              autocomplete="new-password"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <!-- Password Strength Indicator -->
            <div v-if="form.newPassword" class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <q-linear-progress
                  :value="passwordStrength"
                  :color="strengthColor"
                  class="col"
                  size="8px"
                  rounded
                />
                <span class="text-caption" :class="'text-' + strengthColor">{{
                  strengthLabel
                }}</span>
              </div>
              <div class="q-mt-sm">
                <q-list dense class="text-caption">
                  <q-item dense class="q-pa-none">
                    <q-item-section avatar>
                      <q-icon
                        :name="passwordChecks.minLength ? 'check_circle' : 'radio_button_unchecked'"
                        :color="passwordChecks.minLength ? 'green' : 'grey'"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>At least 8 characters</q-item-section>
                  </q-item>
                  <q-item dense class="q-pa-none">
                    <q-item-section avatar>
                      <q-icon
                        :name="passwordChecks.hasUpper ? 'check_circle' : 'radio_button_unchecked'"
                        :color="passwordChecks.hasUpper ? 'green' : 'grey'"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>At least one uppercase letter</q-item-section>
                  </q-item>
                  <q-item dense class="q-pa-none">
                    <q-item-section avatar>
                      <q-icon
                        :name="passwordChecks.hasLower ? 'check_circle' : 'radio_button_unchecked'"
                        :color="passwordChecks.hasLower ? 'green' : 'grey'"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>At least one lowercase letter</q-item-section>
                  </q-item>
                  <q-item dense class="q-pa-none">
                    <q-item-section avatar>
                      <q-icon
                        :name="passwordChecks.hasNumber ? 'check_circle' : 'radio_button_unchecked'"
                        :color="passwordChecks.hasNumber ? 'green' : 'grey'"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>At least one number</q-item-section>
                  </q-item>
                  <q-item dense class="q-pa-none">
                    <q-item-section avatar>
                      <q-icon
                        :name="
                          passwordChecks.hasSpecial ? 'check_circle' : 'radio_button_unchecked'
                        "
                        :color="passwordChecks.hasSpecial ? 'green' : 'grey'"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>At least one special character</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Error Message -->
            <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
              <template v-slot:avatar>
                <q-icon name="error_outline" color="red-8" />
              </template>
              {{ errorMessage }}
            </q-banner>

            <!-- Submit Button -->
            <q-btn
              type="submit"
              color="primary"
              label="Reset Password"
              :loading="loading"
              class="full-width q-py-sm"
              size="lg"
              unelevated
              :disable="!isFormValid"
            >
              <template v-slot:loading>
                <q-spinner-hourglass />
                Resetting...
              </template>
            </q-btn>
          </q-form>
        </q-card-section>

        <!-- Back to Login -->
        <q-card-section class="text-center">
          <q-btn
            flat
            color="primary"
            label="Back to Login"
            icon="arrow_back"
            :to="{ name: 'Login' }"
            :disable="loading"
          />
        </q-card-section>
      </template>
    </q-card>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="80px" color="green" />
          <h5 class="text-green q-mt-md q-mb-xs">Password Reset Successful!</h5>
          <p class="text-grey-7 q-mb-lg">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <q-btn
            color="primary"
            label="Sign In"
            icon="login"
            class="full-width"
            size="lg"
            unelevated
            @click="goToLogin"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from '../../services/api/AuthService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// State
const token = ref('')
const userEmail = ref('')
const isVerifying = ref(true)
const tokenInvalid = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Form
const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

// Password checks
const passwordChecks = computed(() => ({
  minLength: (form.newPassword?.length || 0) >= 8,
  hasUpper: /[A-Z]/.test(form.newPassword || ''),
  hasLower: /[a-z]/.test(form.newPassword || ''),
  hasNumber: /[0-9]/.test(form.newPassword || ''),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword || ''),
}))

// Password strength
const passwordStrength = computed(() => {
  const checks = passwordChecks.value
  const passed = Object.values(checks).filter(Boolean).length
  return passed / 5
})

const strengthColor = computed(() => {
  if (passwordStrength.value < 0.4) return 'red'
  if (passwordStrength.value < 0.6) return 'orange'
  if (passwordStrength.value < 0.8) return 'yellow'
  return 'green'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value < 0.4) return 'Weak'
  if (passwordStrength.value < 0.6) return 'Fair'
  if (passwordStrength.value < 0.8) return 'Good'
  return 'Strong'
})

// Form validation
const isFormValid = computed(() => {
  return (
    form.newPassword.length >= 8 &&
    passwordChecks.value.hasUpper &&
    passwordChecks.value.hasLower &&
    passwordChecks.value.hasNumber &&
    passwordChecks.value.hasSpecial &&
    form.newPassword === form.confirmPassword
  )
})

// Validation rules
const requiredRule = (val: string) => !!val || 'This field is required'

const passwordRules = [
  requiredRule,
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters',
  (val: string) => /[A-Z]/.test(val) || 'Must contain an uppercase letter',
  (val: string) => /[a-z]/.test(val) || 'Must contain a lowercase letter',
  (val: string) => /[0-9]/.test(val) || 'Must contain a number',
  (val: string) => /[!@#$%^&*(),.?":{}|<>]/.test(val) || 'Must contain a special character',
]

const confirmPasswordRule = (val: string) => val === form.newPassword || 'Passwords do not match'

// Lifecycle
onMounted(async () => {
  // Extract token from URL params
  const urlToken = route.params.token as string

  if (!urlToken) {
    tokenInvalid.value = true
    isVerifying.value = false
    return
  }

  token.value = urlToken

  // Verify the token
  await verifyToken(urlToken)
})

// Methods

/**
 * Verify the reset token with the server
 */
async function verifyToken(resetToken: string): Promise<void> {
  isVerifying.value = true
  tokenInvalid.value = false

  try {
    // Verify token validity
    const response = await authService.verifyResetToken(resetToken)

    if (response?.email) {
      userEmail.value = response.email
    }
  } catch (error: any) {
    console.error('Token verification failed:', error)
    tokenInvalid.value = true

    // Check for specific error types
    if (error.response?.status === 410) {
      errorMessage.value = 'This reset link has expired.'
    } else if (error.response?.status === 404) {
      errorMessage.value = 'Invalid reset token.'
    }
  } finally {
    isVerifying.value = false
  }
}

/**
 * Handle password reset submission
 */
async function handleReset(): Promise<void> {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authService.resetPassword({
      token: token.value,
      new_password: form.newPassword,
      confirm_password: form.confirmPassword,
    })

    // Show success
    showSuccess.value = true

    $q.notify({
      type: 'positive',
      message: 'Password reset successfully!',
      position: 'top',
      timeout: 3000,
    })
  } catch (error: any) {
    console.error('Password reset failed:', error)

    const message = error.response?.data?.message || error.message || 'Failed to reset password'
    errorMessage.value = message

    $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 5000,
      actions: [{ icon: 'close', color: 'white' }],
    })

    // Check if token expired during submission
    if (error.response?.status === 410) {
      tokenInvalid.value = true
    }
  } finally {
    loading.value = false
  }
}

/**
 * Navigate to login page
 */
function goToLogin(): void {
  router.push({
    name: 'Login',
    query: { message: 'Password reset successful. Please sign in with your new password.' },
  })
}
</script>

<style lang="scss" scoped>
.reset-password-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .reset-password-card {
    border-radius: 0;
    box-shadow: none;
    width: 100%;
    max-width: 100%;
  }
}
</style>
