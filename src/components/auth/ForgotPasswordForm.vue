<template>
  <div>
    <!-- Step 1: Email Input -->
    <div v-if="step === 1">
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
      </q-form>
    </div>

    <!-- Step 2: Success -->
    <div v-else-if="step === 2" class="text-center">
      <q-icon name="check_circle" size="80px" color="green" />
      <h6 class="text-green q-mt-md q-mb-xs">Email Sent!</h6>
      <p class="text-grey-7 q-mb-lg">
        We've sent password reset instructions to <strong>{{ email }}</strong>
      </p>
      <p class="text-grey-6 text-caption">
        Please check your inbox and spam folder. The link expires in 30 minutes.
      </p>
      <q-btn
        color="primary"
        label="Open Email App"
        icon="email"
        class="full-width q-mt-lg"
        unelevated
        @click="$emit('open-email')"
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
    </div>

    <!-- Error Banner -->
    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 q-mt-md rounded-borders" rounded>
      {{ errorMessage }}
    </q-banner>

    <!-- Back to Login -->
    <div class="text-center q-mt-lg">
      <q-btn flat color="primary" label="Back to Login" icon="arrow_back" :to="{ name: 'Login' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ loading?: boolean; errorMessage?: string }>()
const emit = defineEmits<{
  'send-reset': [email: string]
  resend: [email: string]
  'open-email': []
}>()

const email = ref('')
const step = ref(1)

const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email',
]

function handleSendReset(): void {
  if (!email.value) return
  emit('send-reset', email.value)
  step.value = 2
}

function handleResend(): void {
  emit('resend', email.value)
}
</script>
