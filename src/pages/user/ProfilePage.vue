<!-- src/pages/user/ProfilePage.vue -->
<template>
  <div class="profile-page">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <ProfileCard
          :user="authStore.user"
          :organisation-name="organisationName"
          @change-password="showChangePassword = true"
          @logout="handleLogout"
        />
      </div>
      
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Edit Profile</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-form @submit.prevent="handleUpdateProfile" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model="profileForm.first_name"
                    label="First Name"
                    outlined
                    dense
                    :rules="[requiredRule]"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="profileForm.last_name"
                    label="Last Name"
                    outlined
                    dense
                    :rules="[requiredRule]"
                  />
                </div>
              </div>
              
              <q-input
                v-model="profileForm.email"
                label="Email Address"
                type="email"
                outlined
                dense
                :rules="[emailRule]"
              />
              
              <q-input
                v-model="profileForm.phone"
                label="Phone Number"
                outlined
                dense
              />
              
              <q-select
                v-model="profileForm.preferences.theme"
                :options="themeOptions"
                label="Theme"
                outlined
                dense
              />
              
              <q-select
                v-model="profileForm.preferences.language"
                :options="languageOptions"
                label="Language"
                outlined
                dense
              />
              
              <div class="text-h6 q-mt-md">Notification Preferences</div>
              <q-separator class="q-mb-md" />
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-toggle v-model="profileForm.preferences.notifications.email" label="Email Notifications" />
                  <q-toggle v-model="profileForm.preferences.notifications.push" label="Push Notifications" />
                  <q-toggle v-model="profileForm.preferences.notifications.sms" label="SMS Notifications" />
                </div>
                <div class="col-12 col-md-6">
                  <q-toggle v-model="profileForm.preferences.notifications.workflow_updates" label="Workflow Updates" />
                  <q-toggle v-model="profileForm.preferences.notifications.risk_alerts" label="Risk Alerts" />
                  <q-toggle v-model="profileForm.preferences.notifications.incident_alerts" label="Incident Alerts" />
                </div>
              </div>
              
              <div class="row justify-end q-gutter-md">
                <q-btn label="Cancel" flat color="grey" @click="resetForm" />
                <q-btn
                  type="submit"
                  label="Save Changes"
                  color="primary"
                  :loading="saving"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePassword">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Change Password</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <ChangePasswordForm
            :loading="passwordLoading"
            :error-message="passwordError"
            :success-message="passwordSuccess"
            @submit="handleChangePassword"
            @cancel="showChangePassword = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'
import { ProfileCard, ChangePasswordForm } from 'src/components/auth'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const organisationName = ref('')
const showChangePassword = ref(false)
const saving = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Afrikaans', value: 'af' },
  { label: 'Zulu', value: 'zu' },
  { label: 'Xhosa', value: 'xh' },
]

const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      workflow_updates: true,
      risk_alerts: true,
      incident_alerts: true,
    },
  },
})

const requiredRule = (val: string) => !!val || 'Required'
const emailRule = (val: string) => {
  if (!val) return 'Email is required'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email'
}

onMounted(() => {
  if (authStore.user) {
    profileForm.first_name = authStore.user.first_name || ''
    profileForm.last_name = authStore.user.last_name || ''
    profileForm.email = authStore.user.email || ''
    organisationName.value = 'Demo Organisation'
  }
})

function resetForm() {
  if (authStore.user) {
    profileForm.first_name = authStore.user.first_name || ''
    profileForm.last_name = authStore.user.last_name || ''
    profileForm.email = authStore.user.email || ''
  }
}

async function handleUpdateProfile() {
  saving.value = true
  
  try {
    await authStore.updateProfile({
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      email: profileForm.email,
    })
    
    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top',
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to update profile',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function handleChangePassword(data: { currentPassword: string; newPassword: string }) {
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  
  try {
    await authStore.changePassword(data.currentPassword, data.newPassword)
    passwordSuccess.value = 'Password changed successfully!'
    setTimeout(() => {
      showChangePassword.value = false
      passwordSuccess.value = ''
    }, 2000)
  } catch (err: any) {
    passwordError.value = err.message || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

async function handleLogout() {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authStore.logout()
    router.push({ name: 'Login' })
  })
}
</script>