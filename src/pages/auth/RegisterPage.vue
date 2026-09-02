<template>
  <div class="register-page">
    <div class="text-center q-mb-md">
      <q-icon name="person_add" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">{{ $t('auth.create_account') }}</div>
      <div class="text-subtitle2 text-grey-6">{{ $t('auth.join_platform') }}</div>
    </div>

    <RegisterForm
      :loading="isLoading"
      :error-message="errorMessage"
      :organisation-options="organisationOptions"
      @submit="handleRegister"
      @view-terms="showTerms"
      @view-privacy="showPrivacy"
    />

    <div class="text-center q-mt-md">
      <q-btn
        flat
        dense
        color="primary"
        :label="$t('auth.have_account')"
        :to="{ name: 'Login' }"
        no-caps
      />
    </div>

    <!-- Terms Dialog -->
    <q-dialog v-model="termsDialog">
      <q-card style="min-width: 350px; max-width: 600px; width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ $t('auth.terms_of_service') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="scroll" style="max-height: 400px">
          <div class="text-body2" v-html="termsContent" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { RegisterForm } from 'src/components/auth'
import { useApi } from 'src/composables/useApi'
import type { RegistrationData } from 'src/models/entities/user/user.entity'

const router = useRouter()
const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const { register, isLoading } = useAuth()

// ============================================
// API Composable
// ============================================
const { get } = useApi()

// ============================================
// Local State
// ============================================
const errorMessage = ref('')
const organisationOptions = ref<Array<{ label: string; value: string }>>([])
const termsDialog = ref(false)
const termsContent = ref('')

// ============================================
// Computed
// ============================================

// ============================================
// Methods
// ============================================
async function loadOrganisations(): Promise<void> {
  try {
    const response = (await get('/organisations')) as Array<{ uuid: string; name: string }>
    if (response) {
      organisationOptions.value = response.map((org) => ({
        label: org.name,
        value: org.uuid,
      }))
    }
  } catch (err) {
    console.error('Failed to load organisations:', err)
  }
}

async function handleRegister(data: RegistrationData): Promise<void> {
  errorMessage.value = ''

  try {
    await register({
      email: data.email,
      password: data.password,
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.organisationId !== undefined && { organisationId: data.organisationId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      ...(data.role !== undefined && { role: data.role }),
    })

    $q.notify({
      type: 'positive',
      message: 'Registration successful! Please check your email to verify your account.',
      position: 'top',
      timeout: 5000,
    })

    router.push({ name: 'Login' })
  } catch (err: any) {
    errorMessage.value = err.message || 'Registration failed'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  }
}

function showTerms(): void {
  termsContent.value = `
    <h6>1. Acceptance of Terms</h6>
    <p>By accessing and using the platform, you agree to be bound by these Terms of Service.</p>
    <h6>2. User Accounts</h6>
    <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
    <h6>3. Data Privacy</h6>
    <p>We collect and process personal data in accordance with our Privacy Policy.</p>
    <h6>4. Acceptable Use</h6>
    <p>You agree not to misuse the platform or interfere with its operation.</p>
  `
  termsDialog.value = true
}

function showPrivacy(): void {
  $q.notify({
    type: 'info',
    message: 'Privacy policy dialog would open here',
    position: 'top',
  })
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadOrganisations()
})
</script>

<style lang="scss" scoped>
.register-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 8px 16px;

  @media (max-width: 400px) {
    padding: 8px 12px;
  }
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}
</style>