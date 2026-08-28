<template>
  <q-form @submit.prevent="handleSubmit" class="login-form">
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
      class="login-form__field"
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
      class="login-form__field"
    >
      <template v-slot:prepend>
        <q-icon name="lock" color="primary" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer login-form__toggle-password"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <!-- Remember Me & Forgot Password -->
    <div class="login-form__row login-form__row--between">
      <q-checkbox
        v-model="form.rememberMe"
        label="Remember me"
        dense
        color="primary"
        :disable="loading"
        class="login-form__checkbox"
      />
      <q-btn
        flat
        dense
        color="primary"
        label="Forgot Password?"
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
      class="login-form__submit-btn full-width q-py-sm"
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
      class="login-form__biometric-btn full-width q-mt-sm"
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

  // Consistent spacing between form elements
  .login-form__field {
    margin-bottom: 20px;

    // Fix for q-input internal padding
    :deep(.q-field__control) {
      padding-left: 12px;
      padding-right: 12px;
    }

    :deep(.q-field__native) {
      padding-left: 8px;
      padding-right: 8px;
    }

    :deep(.q-field__prepend) {
      padding-right: 8px;
    }

    :deep(.q-field__append) {
      padding-left: 8px;
    }
  }

  // Row with Remember Me and Forgot Password
  .login-form__row--between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
    margin-bottom: 16px;

    .login-form__checkbox {
      margin: 0;
      padding: 0;
    }

    .login-form__forgot-btn {
      margin: 0;
      padding: 4px 8px;
      font-size: 0.875rem;
      min-height: 32px;
    }
  }

  // Error Banner
  .login-form__error-banner {
    width: 100%;
    margin: 0 0 16px 0;
    padding: 12px 16px;
  }

  // Submit Button
  .login-form__submit-btn {
    margin: 0;
    padding: 10px 0;
    min-height: 48px;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  // Biometric Button
  .login-form__biometric-btn {
    margin-top: 12px;
    padding: 10px 0;
    min-height: 48px;
  }

  // Toggle password icon
  .login-form__toggle-password {
    padding: 4px;
  }
}

// Mobile adjustments
@media (max-width: 600px) {
  .login-form {
    max-width: 100%;
    padding: 0 4px;

    .login-form__field {
      margin-bottom: 16px;

      :deep(.q-field__control) {
        padding-left: 10px;
        padding-right: 10px;
      }

      :deep(.q-field__native) {
        padding-left: 6px;
        padding-right: 6px;
        font-size: 16px; // Prevents iOS zoom
      }
    }

    .login-form__row--between {
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .login-form__checkbox {
        font-size: 0.875rem;
      }

      .login-form__forgot-btn {
        font-size: 0.8125rem;
        padding: 2px 6px;
      }
    }

    .login-form__submit-btn {
      padding: 8px 0;
      min-height: 44px;
      font-size: 0.9375rem;
    }

    .login-form__biometric-btn {
      padding: 8px 0;
      min-height: 44px;
      font-size: 0.875rem;
    }

    .login-form__error-banner {
      padding: 10px 12px;
      font-size: 0.875rem;
    }
  }
}

// Tablet adjustments
@media (min-width: 601px) and (max-width: 1024px) {
  .login-form {
    max-width: 380px;

    .login-form__field {
      :deep(.q-field__native) {
        font-size: 16px;
      }
    }
  }
}
</style>