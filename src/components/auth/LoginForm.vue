<template>
  <q-form @submit.prevent="handleSubmit" class="login-form">
    <!-- Email Field -->
    <q-input
      v-model="form.email"
      :label="$t('auth.email')"
      type="email"
      outlined
      dense
      lazy-rules
      :rules="emailRules"
      :disable="loading"
      autocomplete="email"
      autofocus
      clearable
      class="login-form__field"
    >
      <template v-slot:prepend>
        <q-icon name="email" color="primary" size="20px" />
      </template>
    </q-input>

    <!-- Password Field -->
    <q-input
      v-model="form.password"
      :label="$t('auth.password')"
      :type="showPassword ? 'text' : 'password'"
      outlined
      dense
      lazy-rules
      :rules="passwordRules"
      :disable="loading"
      autocomplete="current-password"
      class="login-form__field"
    >
      <template v-slot:prepend>
        <q-icon name="lock" color="primary" size="20px" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer login-form__toggle-password"
          size="20px"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <!-- Remember Me & Forgot Password -->
    <div class="login-form__row login-form__row--between">
      <q-checkbox
        v-model="form.rememberMe"
        :label="$t('auth.rememberMe')"
        dense
        color="primary"
        :disable="loading"
        class="login-form__checkbox"
      />
      <q-btn
        flat
        dense
        color="primary"
        :label="$t('auth.forgotPassword')"
        no-caps
        :to="{ name: 'ForgotPassword' }"
        :disable="loading"
        class="login-form__forgot-btn"
      />
    </div>

    <!-- Error Alert -->
    <q-banner
      v-if="errorMessage"
      class="login-form__error-banner bg-red-1 text-red-8 rounded-borders"
      rounded
    >
      <template v-slot:avatar>
        <q-icon name="error_outline" color="red-8" size="18px" />
      </template>
      {{ errorMessage }}
      <template v-slot:action>
        <q-btn flat dense color="red-8" :label="$t('common.dismiss')" @click="$emit('clear-error')" />
      </template>
    </q-banner>

    <!-- Submit Button -->
    <q-btn
      type="submit"
      color="primary"
      :label="$t('auth.login')"
      :loading="loading"
      class="login-form__submit-btn full-width"
      size="lg"
      unelevated
    >
      <template v-slot:loading>
        <q-spinner-hourglass size="20px" />
        {{ $t('auth.loginProgress') }}
      </template>
    </q-btn>

    <!-- Biometric Login -->
    <q-btn
      v-if="biometricAvailable"
      outline
      color="primary"
      icon="fingerprint"
      :label="$t('auth.biometricLogin')"
      class="login-form__biometric-btn full-width"
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

<style lang="scss" scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0;

  .login-form__field {
    margin-bottom: 16px;

    @media (max-width: 400px) {
      margin-bottom: 10px;

      :deep(.q-field__native) {
        font-size: 16px;
        padding-left: 6px;
        padding-right: 6px;
      }

      :deep(.q-field__control) {
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }

  .login-form__row--between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
    margin-bottom: 12px;

    @media (max-width: 400px) {
      flex-wrap: wrap;
      gap: 4px;
    }

    .login-form__checkbox {
      margin: 0;
      padding: 0;
    }

    .login-form__forgot-btn {
      margin: 0;
      padding: 4px 8px;
      font-size: 0.8125rem;
      min-height: 32px;
    }
  }

  .login-form__error-banner {
    width: 100%;
    margin: 0 0 12px 0;
    padding: 10px 14px;

    @media (max-width: 400px) {
      padding: 8px 12px;
      font-size: 0.8125rem;
    }
  }

  .login-form__submit-btn {
    margin: 0;
    padding: 10px 0;
    min-height: 44px;
    font-size: 0.9375rem;
    font-weight: 600;

    @media (max-width: 400px) {
      padding: 8px 0;
      min-height: 40px;
      font-size: 0.875rem;
    }
  }

  .login-form__biometric-btn {
    margin-top: 10px;
    padding: 10px 0;
    min-height: 44px;

    @media (max-width: 400px) {
      padding: 8px 0;
      min-height: 40px;
      font-size: 0.8125rem;
    }
  }

  .login-form__toggle-password {
    padding: 4px;
  }
}
</style>