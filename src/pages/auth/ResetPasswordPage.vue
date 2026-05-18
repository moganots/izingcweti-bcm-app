<template>
  <div class="reset-password-page">
    <div class="text-center q-mb-md">
      <q-icon name="vpn_key" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">Create New Password</div>
      <div class="text-subtitle2 text-grey-6">Enter your new password below</div>
    </div>

    <q-form @submit.prevent="handleReset" class="q-gutter-md">
      <q-input
        v-model="newPassword"
        label="New Password"
        :type="showNewPass ? 'text' : 'password'"
        outlined
        dense
        :rules="passwordRules"
        :disable="loading"
      >
        <template v-slot:append>
          <q-icon
            :name="showNewPass ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showNewPass = !showNewPass"
          />
        </template>
      </q-input>

      <q-input
        v-model="confirmPassword"
        label="Confirm Password"
        :type="showConfirmPass ? 'text' : 'password'"
        outlined
        dense
        :rules="[requiredRule, confirmRule]"
        :disable="loading"
      >
        <template v-slot:append>
          <q-icon
            :name="showConfirmPass ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showConfirmPass = !showConfirmPass"
          />
        </template>
      </q-input>

      <!-- Password Strength -->
      <div v-if="newPassword">
        <q-linear-progress :value="strength" :color="strengthColor" class="q-mb-xs" />
        <span class="text-caption">{{ strengthLabel }}</span>
      </div>

      <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders">
        {{ errorMessage }}
      </q-banner>

      <q-btn
        type="submit"
        color="primary"
        label="Reset Password"
        :loading="loading"
        class="full-width q-py-sm"
        size="lg"
        unelevated
      />
    </q-form>

    <div class="text-center q-mt-md">
      <q-btn flat dense color="primary" label="Back to Login" :to="{ name: 'Login' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/api/auth/AuthService'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const loading = ref(false)
const errorMessage = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPass = ref(false)
const showConfirmPass = ref(false)
const token = ref('')

onMounted(() => {
  token.value = (route.query.token as string) || ''
  if (!token.value) {
    errorMessage.value = 'Invalid reset link. Please request a new one.'
  }
})

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

const strengthColor = computed(() =>
  strength.value < 0.3 ? 'red' : strength.value < 0.6 ? 'orange' : 'green'
)

const strengthLabel = computed(() =>
  strength.value < 0.3 ? 'Weak' : strength.value < 0.6 ? 'Fair' : 'Strong'
)

const requiredRule = (val: string) => !!val || 'Required'

const passwordRules = [
  requiredRule,
  (v: string) => v.length >= 8 || 'Min 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Need uppercase',
  (v: string) => /[0-9]/.test(v) || 'Need number',
]

const confirmRule = (v: string) => v === newPassword.value || 'Passwords do not match'

async function handleReset() {
  if (!token.value) {
    errorMessage.value = 'Invalid reset token'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authService.resetPassword({
      token: token.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    })

    $q.notify({
      type: 'positive',
      message: 'Password reset successful! Please login with your new password.',
      position: 'top',
    })

    router.push({ name: 'Login' })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to reset password'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>
