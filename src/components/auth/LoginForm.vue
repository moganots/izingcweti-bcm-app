<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <!-- Email Field -->
    <q-input
      v-model="form.email"
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
      :disable="loading"
      autocomplete="current-password"
    >
      <template v-slot:prepend>
        <q-icon name="lock" color="primary" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
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
        :disable="loading"
      />
      <q-btn
        flat
        dense
        color="primary"
        label="Forgot Password?"
        no-caps
        :to="{ name: 'ForgotPassword' }"
        :disable="loading"
      />
    </div>

    <!-- Error Alert -->
    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
      <template v-slot:avatar>
        <q-icon name="error_outline" color="red-8" />
      </template>
      {{ errorMessage }}
      <template v-slot:action>
        <q-btn flat color="red-8" label="Dismiss" @click="$emit('clear-error')" />
      </template>
    </q-banner>

    <!-- Submit Button -->
    <q-btn
      type="submit"
      color="primary"
      label="Sign In"
      :loading="loading"
      class="full-width q-py-sm"
      size="lg"
      unelevated
    >
      <template v-slot:loading>
        <q-spinner-hourglass />
        Signing in...
      </template>
    </q-btn>

    <!-- Biometric Login -->
    <q-btn
      v-if="biometricAvailable"
      outline
      color="primary"
      icon="fingerprint"
      label="Sign in with Biometrics"
      class="full-width q-mt-sm"
      :disable="loading"
      @click="$emit('biometric-login')"
    />
  </q-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    errorMessage?: string
    biometricAvailable?: boolean
    savedEmail?: string
  }>(),
  {
    loading: false,
    errorMessage: '',
    biometricAvailable: false,
    savedEmail: '',
  }
)

const emit = defineEmits<{
  submit: [data: { email: string; password: string; rememberMe: boolean }]
  'biometric-login': []
  'clear-error': []
}>()

const showPassword = ref(false)

const form = reactive({
  email: props.savedEmail || '',
  password: '',
  rememberMe: !!props.savedEmail,
})

watch(
  () => props.savedEmail,
  (val) => {
    if (val) form.email = val
  }
)

const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email',
]

const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 6 || 'Password must be at least 6 characters',
]

function handleSubmit(): void {
  if (!form.email || !form.password) return
  emit('submit', { ...form })
}
</script>
