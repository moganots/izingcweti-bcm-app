<template>
  <div class="reset-password-page">
    <div class="text-center q-mb-md">
      <q-icon name="vpn_key" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">{{ $t('auth.create_new_password') }}</div>
      <div class="text-subtitle2 text-grey-6">{{ $t('auth.enter_new_password') }}</div>
    </div>

    <q-form @submit.prevent="handleReset" class="q-gutter-md">
      <q-input v-model="newPassword" :label="$t('auth.new_password')" :type="showNewPass ? 'text' : 'password'" outlined
        dense :rules="passwordRules" :disable="isLoading" autofocus>
        <template v-slot:append>
          <q-icon :name="showNewPass ? 'visibility_off' : 'visibility'" class="cursor-pointer"
            @click="showNewPass = !showNewPass" />
        </template>
      </q-input>

      <q-input v-model="confirmPassword" :label="$t('auth.confirm_password')"
        :type="showConfirmPass ? 'text' : 'password'" outlined dense :rules="[requiredRule, confirmRule]"
        :disable="isLoading">
        <template v-slot:append>
          <q-icon :name="showConfirmPass ? 'visibility_off' : 'visibility'" class="cursor-pointer"
            @click="showConfirmPass = !showConfirmPass" />
        </template>
      </q-input>

      <!-- Password Strength -->
      <div v-if="newPassword" class="password-strength">
        <q-linear-progress :value="strength" :color="strengthColor" class="q-mb-xs" />
        <span class="text-caption">{{ strengthLabel }}</span>
      </div>

      <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-btn type="submit" color="primary" :label="$t('auth.reset_password')" :loading="isLoading"
        class="full-width q-py-sm" size="lg" unelevated />
    </q-form>

    <div class="text-center q-mt-md">
      <q-btn flat dense color="primary" :label="$t('auth.back_to_login')" :to="{ name: 'Login' }" no-caps />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const { resetPassword, isLoading } = useAuth()

// ============================================
// Local State
// ============================================
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPass = ref(false)
const showConfirmPass = ref(false)
const errorMessage = ref('')
const token = ref('')

// ============================================
// Password Strength
// ============================================
const strength = computed(() => {
  const p = newPassword.value
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s += 0.25
  if (p.length >= 12) s += 0.25
  if (/[A-Z]/.test(p)) s += 0.25
  if (/[0-9]/.test(p)) s += 0.25
  if (/[!@#$%^&*]/.test(p)) s += 0.25
  return Math.min(s, 1)
})

const strengthColor = computed(() => {
  if (strength.value < 0.3) return 'red'
  if (strength.value < 0.6) return 'orange'
  return 'green'
})

const strengthLabel = computed(() => {
  if (strength.value < 0.3) return 'Weak'
  if (strength.value < 0.6) return 'Fair'
  return 'Strong'
})

// ============================================
// Validation Rules
// ============================================
const requiredRule = (val: string) => !!val || 'This field is required'

const passwordRules = [
  requiredRule,
  (v: string) => v.length >= 8 || 'Minimum 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Must contain uppercase letter',
  (v: string) => /[0-9]/.test(v) || 'Must contain a number',
]

const confirmRule = (v: string) => v === newPassword.value || 'Passwords do not match'

// ============================================
// Methods
// ============================================
async function handleReset(): Promise<void> {
  if (!token.value) {
    errorMessage.value = 'Invalid reset token'
    return
  }

  errorMessage.value = ''

  try {
    await resetPassword(token.value, newPassword.value)

    $q.notify({
      type: 'positive',
      message: 'Password reset successful! Please login with your new password.',
      position: 'top',
    })

    router.push({ name: 'Login' })
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to reset password'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  token.value = (route.query.token as string) || ''
  if (!token.value) {
    errorMessage.value = 'Invalid reset link. Please request a new one.'
  }
})
</script>

<style lang="scss" scoped>
.reset-password-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 8px 16px;

  @media (max-width: 400px) {
    padding: 8px 12px;
  }
}

.password-strength {
  margin-top: -8px;
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}
</style>