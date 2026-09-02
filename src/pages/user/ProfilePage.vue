<template>
  <div class="profile-page">
    <div class="row q-col-gutter-md">
      <!-- Profile Card -->
      <div class="col-12 col-md-4">
        <ProfileCard
          :user="user"
          :organisation-name="organisationName"
          @change-password="showChangePassword = true"
          @logout="handleLogout"
        />
      </div>

      <!-- Edit Profile Form -->
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
                    v-model="profileForm.firstName"
                    label="First Name"
                    outlined
                    dense
                    :rules="[requiredRule]"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="profileForm.lastName"
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
                v-model="profileForm.phoneNumber"
                label="Phone Number"
                outlined
                dense
              />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-select
                    v-model="profileForm.theme"
                    :options="themeOptions"
                    label="Theme"
                    outlined
                    dense
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="profileForm.language"
                    :options="languageOptions"
                    label="Language"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- Notification Preferences -->
              <div class="text-h6 q-mt-md">Notification Preferences</div>
              <q-separator class="q-mb-md" />

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-toggle v-model="profileForm.notifications.email" label="Email Notifications" />
                  <q-toggle v-model="profileForm.notifications.push" label="Push Notifications" />
                  <q-toggle v-model="profileForm.notifications.sms" label="SMS Notifications" />
                </div>
                <div class="col-12 col-md-6">
                  <q-toggle v-model="profileForm.notifications.workflowUpdates" label="Workflow Updates" />
                  <q-toggle v-model="profileForm.notifications.riskAlerts" label="Risk Alerts" />
                  <q-toggle v-model="profileForm.notifications.incidentAlerts" label="Incident Alerts" />
                </div>
              </div>

              <div class="row justify-end q-gutter-md q-mt-md">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../../composables/useAuth'
import { ProfileCard, ChangePasswordForm } from '../../components/auth'

const router = useRouter()
const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const auth = useAuth()

// State
const showChangePassword = ref(false)
const saving = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const organisationName = ref('')

// ============================================
// User Data
// ============================================
const user = computed(() => auth.user.value)

// ============================================
// Profile Form
// ============================================
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    workflowUpdates: true,
    riskAlerts: true,
    incidentAlerts: true,
  },
})

// ============================================
// Options
// ============================================
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

// ============================================
// Validation Rules
// ============================================
const requiredRule = (val: string) => !!val || 'This field is required'

const emailRule = (val: string) => {
  if (!val) return 'Email is required'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email address'
}

// ============================================
// Methods
// ============================================

/**
 * Load user data into form
 */
function loadUserData(): void {
  if (user.value) {
    profileForm.firstName = user.value.firstName || ''
    profileForm.lastName = user.value.lastName || ''
    profileForm.email = user.value.email || ''
    profileForm.phoneNumber = user.value.phoneNumber || ''

    // Load preferences if they exist
    if (user.value.preferences) {
      const prefs = user.value.preferences
      profileForm.theme = prefs.theme || 'light'
      profileForm.language = prefs.language || 'en'

      if (prefs.notifications) {
        profileForm.notifications = {
          ...profileForm.notifications,
          ...prefs.notifications,
        }
      }
    }

    // Load organisation name
    organisationName.value = user.value.organisation?.name || 'N/A'
  }
}

/**
 * Reset form to current user data
 */
function resetForm(): void {
  loadUserData()
}

/**
 * Update user profile
 */
async function handleUpdateProfile(): Promise<void> {
  saving.value = true

  try {
    const updateData = {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phoneNumber: profileForm.phoneNumber,
      preferences: {
        theme: profileForm.theme,
        language: profileForm.language,
        notifications: profileForm.notifications,
      },
    }

    await auth.updateProfile(updateData)

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

/**
 * Handle password change
 */
async function handleChangePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await auth.changePassword(data.currentPassword, data.newPassword)

    passwordSuccess.value = 'Password changed successfully!'

    // Auto-close dialog after success
    setTimeout(() => {
      showChangePassword.value = false
      passwordSuccess.value = ''
    }, 2000)
  } catch (err: any) {
    passwordError.value = err.message || 'Failed to change password. Please check your current password.'
  } finally {
    passwordLoading.value = false
  }
}

/**
 * Handle logout
 */
async function handleLogout(): Promise<void> {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await auth.logout()
    router.push({ name: 'Login' })
  })
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  if (auth.isAuthenticated.value) {
    loadUserData()
  }
})

// Watch for user changes
watch(
  () => auth.user.value,
  (newUser) => {
    if (newUser) {
      loadUserData()
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 16px 0;

  @media (max-width: 600px) {
    padding: 8px 0;
  }
}
</style>