<template>
  <div class="register-page">
    <div class="text-center q-mb-md">
      <q-icon name="person_add" size="48px" color="primary" />
      <div class="text-h5 q-mt-sm">Create Account</div>
      <div class="text-subtitle2 text-grey-6">Join the BCM platform</div>
    </div>

    <RegisterForm
      :loading="loading"
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
        label="Already have an account? Sign in"
        :to="{ name: 'Login' }"
      />
    </div>

    <!-- Terms Dialog -->
    <q-dialog v-model="termsDialog">
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">Terms of Service</div>
        </q-card-section>
        <q-card-section class="scroll" style="max-height: 400px">
          <div class="text-body2">
            <h6>1. Acceptance of Terms</h6>
            <p>
              By accessing and using Izingcweti BCM App, you agree to be bound by these Terms of
              Service...
            </p>
            <h6>2. User Accounts</h6>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials...
            </p>
            <h6>3. Data Privacy</h6>
            <p>We collect and process personal data in accordance with our Privacy Policy...</p>
            <h6>4. Acceptable Use</h6>
            <p>You agree not to misuse the platform or interfere with its operation...</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'
import { RegisterForm } from 'src/components/auth'
import { organisationService } from 'src/services/api/organisation/OrganisationService'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const organisationOptions = ref<Array<{ label: string; value: string }>>([])
const termsDialog = ref(false)

onMounted(async () => {
  await loadOrganisations()
})

async function loadOrganisations() {
  try {
    const orgs = await organisationService.getOrganisations()
    organisationOptions.value = orgs.map((org) => ({
      label: org.name,
      value: org.uuid,
    }))
  } catch (err) {
    console.error('Failed to load organisations:', err)
  }
}

async function handleRegister(data: any) {
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      organisation_id: data.organisation,
    })

    $q.notify({
      type: 'positive',
      message: 'Registration successful! Please check your email to verify your account.',
      position: 'top',
      timeout: 5000,
    })

    router.push({ name: 'Login' })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Registration failed'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function showTerms() {
  termsDialog.value = true
}

function showPrivacy() {
  // Show privacy dialog
  $q.notify({
    type: 'info',
    message: 'Privacy policy dialog would open here',
    position: 'top',
  })
}
</script>
