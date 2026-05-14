<!-- src/pages/auth/ProfilePage.vue -->
<template>
  <q-page padding>
    <div class="profile-container q-pa-md">
      <!-- Profile Header -->
      <q-card class="profile-header q-mb-lg" flat bordered>
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <q-avatar size="80px" class="q-mr-md">
              <q-icon name="person" size="50px" />
            </q-avatar>
            <div>
              <h5 class="q-mb-xs">{{ user?.email || 'User' }}</h5>
              <q-badge color="white" text-color="primary" class="q-px-md q-py-xs">
                {{ user?.role || 'Loading...' }}
              </q-badge>
              <div class="q-mt-sm">
                <q-icon name="business" size="16px" class="q-mr-xs" />
                <span class="text-caption">{{ organisationName || 'No organisation' }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Account Information -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Account Information</div>

          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="email" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label>{{ user?.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="content_copy"
                  size="sm"
                  @click="copyToClipboard(user?.email)"
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Role</q-item-label>
                <q-item-label>{{ user?.role }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="calendar_today" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Member Since</q-item-label>
                <q-item-label>{{ formatDate(user?.created_at) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="login" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Last Login</q-item-label>
                <q-item-label>{{ formatDate(user?.last_login) || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="circle" :color="user?.is_active ? 'green' : 'red'" size="12px" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Account Status</q-item-label>
                <q-item-label>
                  <q-badge :color="user?.is_active ? 'green' : 'red'">
                    {{ user?.is_active ? 'Active' : 'Inactive' }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="user?.training_completed_at">
              <q-item-section avatar>
                <q-icon name="school" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Training Completed</q-item-label>
                <q-item-label>{{ formatDate(user?.training_completed_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Actions</div>

          <q-list>
            <q-item clickable v-ripple @click="showChangePasswordDialog = true">
              <q-item-section avatar>
                <q-icon name="lock" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Change Password</q-item-label>
                <q-item-label caption>Update your account password</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="showNotificationPrefs = true">
              <q-item-section avatar>
                <q-icon name="notifications" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notification Preferences</q-item-label>
                <q-item-label caption>Manage your notification settings</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="showThemeDialog = true">
              <q-item-section avatar>
                <q-icon name="palette" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Theme Settings</q-item-label>
                <q-item-label caption>Toggle dark mode</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="uiStore.isDarkMode"
                  color="primary"
                  @update:model-value="uiStore.toggleDarkMode()"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-negative">Logout</q-item-label>
                <q-item-label caption>Sign out of your account</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- App Info -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">About</div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>App Version</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>v{{ appVersion }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Sync Status</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="syncStore.hasPendingChanges ? 'orange' : 'green'">
                  {{ syncStore.hasPendingChanges ? 'Pending' : 'Synced' }}
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item v-if="syncStore.lastSyncAt">
              <q-item-section>
                <q-item-label>Last Synced</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ formatDate(syncStore.lastSyncAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePasswordDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Change Password</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleChangePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.currentPassword"
              label="Current Password"
              :type="showCurrentPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="[requiredRule]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showCurrentPassword = !showCurrentPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.newPassword"
              label="New Password"
              :type="showNewPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="passwordRules"
            >
              <template v-slot:append>
                <q-icon
                  :name="showNewPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              dense
              lazy-rules
              :rules="[requiredRule, confirmPasswordRule]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <!-- Password Strength Indicator -->
            <div v-if="passwordForm.newPassword" class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <q-linear-progress
                  :value="passwordStrength"
                  :color="passwordStrengthColor"
                  class="col"
                />
                <span class="text-caption">{{ passwordStrengthLabel }}</span>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            color="primary"
            label="Change Password"
            :loading="isChangingPassword"
            @click="handleChangePassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth.store'
import { useSyncStore } from '../../stores/sync.store'
import { useUiStore } from '../../stores/ui.store'
import { AuthService } from '../../services/api/AuthService'
import { formatDate } from '../../utils/date.utils'

// Router
const router = useRouter()
const $q = useQuasar()

// Stores
const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUiStore()

// Computed
const user = computed(() => authStore.user)
const organisationName = computed(() => 'BCM Test Corp') // Placeholder
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0')

// Dialogs
const showChangePasswordDialog = ref(false)
const showNotificationPrefs = ref(false)
const showThemeDialog = ref(false)

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isChangingPassword = ref(false)

// Password strength
const passwordStrength = computed(() => {
  const password = passwordForm.newPassword
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength += 0.25
  if (password.length >= 12) strength += 0.25
  if (/[A-Z]/.test(password)) strength += 0.25
  if (/[0-9]/.test(password)) strength += 0.25
  if (/[!@#$%^&*]/.test(password)) strength += 0.25

  return Math.min(strength, 1)
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 0.3) return 'red'
  if (passwordStrength.value < 0.6) return 'orange'
  if (passwordStrength.value < 0.8) return 'yellow'
  return 'green'
})

const passwordStrengthLabel = computed(() => {
  if (passwordStrength.value < 0.3) return 'Weak'
  if (passwordStrength.value < 0.6) return 'Fair'
  if (passwordStrength.value < 0.8) return 'Good'
  return 'Strong'
})

// Validation rules
const requiredRule = (val: string) => !!val || 'This field is required'

const passwordRules = [
  requiredRule,
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters',
  (val: string) =>
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(val) ||
    'Password must contain uppercase, number, and special character',
]

const confirmPasswordRule = (val: string) =>
  val === passwordForm.newPassword || 'Passwords do not match'

// Methods
function copyToClipboard(text?: string): void {
  if (!text) return

  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Copied to clipboard!',
      position: 'top',
      timeout: 2000,
    })
  })
}

async function handleChangePassword(): Promise<void> {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all fields',
      position: 'top',
    })
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match',
      position: 'top',
    })
    return
  }

  isChangingPassword.value = true

  try {
    await AuthService.changePassword({
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
    })

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully!',
      position: 'top',
    })

    showChangePasswordDialog.value = false

    // Reset form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to change password',
      position: 'top',
    })
  } finally {
    isChangingPassword.value = false
  }
}

async function handleLogout(): Promise<void> {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to log out?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await authStore.logout()
      await router.push('/auth/login')

      $q.notify({
        type: 'positive',
        message: 'Logged out successfully',
        position: 'top',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  .q-avatar {
    background: rgba(255, 255, 255, 0.2);
    border: 3px solid rgba(255, 255, 255, 0.5);
  }
}
</style>
