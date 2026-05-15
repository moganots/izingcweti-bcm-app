<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input
          v-model="form.firstName"
          label="First Name"
          outlined
          dense
          :rules="[requiredRule]"
          :disable="loading"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="form.lastName"
          label="Last Name"
          outlined
          dense
          :rules="[requiredRule]"
          :disable="loading"
        />
      </div>
    </div>

    <q-input
      v-model="form.email"
      label="Email Address"
      type="email"
      outlined
      dense
      :rules="emailRules"
      :disable="loading"
      autocomplete="email"
    >
      <template v-slot:prepend><q-icon name="email" color="primary" /></template>
    </q-input>

    <q-input
      v-model="form.password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      outlined
      dense
      :rules="passwordRules"
      :disable="loading"
      autocomplete="new-password"
    >
      <template v-slot:prepend><q-icon name="lock" color="primary" /></template>
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <q-input
      v-model="form.confirmPassword"
      label="Confirm Password"
      :type="showConfirm ? 'text' : 'password'"
      outlined
      dense
      :rules="[requiredRule, confirmPasswordRule]"
      :disable="loading"
      autocomplete="new-password"
    >
      <template v-slot:append>
        <q-icon
          :name="showConfirm ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showConfirm = !showConfirm"
        />
      </template>
    </q-input>

    <!-- Password Strength -->
    <div v-if="form.password" class="q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-linear-progress :value="passwordStrength" :color="strengthColor" class="col" />
        <span class="text-caption">{{ strengthLabel }}</span>
      </div>
    </div>

    <q-select
      v-model="form.organisation"
      :options="organisationOptions"
      label="Organisation"
      outlined
      dense
      :rules="[requiredRule]"
      :disable="loading"
      emit-value
      map-options
    />

    <q-checkbox v-model="form.acceptTerms" dense :disable="loading">
      I accept the
      <a href="#" @click.prevent="$emit('view-terms')">Terms of Service</a>
      and
      <a href="#" @click.prevent="$emit('view-privacy')">Privacy Policy</a>
    </q-checkbox>

    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
      {{ errorMessage }}
    </q-banner>

    <q-btn
      type="submit"
      color="primary"
      label="Create Account"
      :loading="loading"
      class="full-width q-py-sm"
      size="lg"
      unelevated
      :disable="!form.acceptTerms"
    />
  </q-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    errorMessage?: string
    organisationOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    loading: false,
    errorMessage: '',
    organisationOptions: () => [],
  }
)

const emit = defineEmits<{
  submit: [data: any]
  'view-terms': []
  'view-privacy': []
}>()

const showPassword = ref(false)
const showConfirm = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  organisation: '',
  acceptTerms: false,
})

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 0.25
  if (p.length >= 12) score += 0.25
  if (/[A-Z]/.test(p)) score += 0.25
  if (/[0-9]/.test(p)) score += 0.25
  if (/[!@#$%^&*]/.test(p)) score += 0.25
  return Math.min(score, 1)
})

const strengthColor = computed(() => {
  if (passwordStrength.value < 0.3) return 'red'
  if (passwordStrength.value < 0.6) return 'orange'
  if (passwordStrength.value < 0.8) return 'yellow'
  return 'green'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value < 0.3) return 'Weak'
  if (passwordStrength.value < 0.6) return 'Fair'
  if (passwordStrength.value < 0.8) return 'Good'
  return 'Strong'
})

const requiredRule = (val: any) => !!val || 'This field is required'

const emailRules = [
  requiredRule,
  (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email',
]

const passwordRules = [
  requiredRule,
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters',
  (val: string) => /[A-Z]/.test(val) || 'Must contain an uppercase letter',
  (val: string) => /[0-9]/.test(val) || 'Must contain a number',
  (val: string) => /[!@#$%^&*]/.test(val) || 'Must contain a special character',
]

const confirmPasswordRule = (val: string) => val === form.password || 'Passwords do not match'

function handleSubmit(): void {
  if (!form.email || !form.password || form.password !== form.confirmPassword) return
  emit('submit', { ...form })
}
</script>
