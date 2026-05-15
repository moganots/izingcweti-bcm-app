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
              <h5 class="q-mb-xs">{{ displayName }}</h5>
              <q-badge color="white" text-color="primary" class="q-px-md q-py-xs">{{
                user?.role || 'User'
              }}</q-badge>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Account Info -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Account Information</div>
          <q-list separator>
            <q-item>
              <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
              <q-item-section
                ><q-item-label caption>Email</q-item-label
                ><q-item-label>{{ user?.email }}</q-item-label></q-item-section
              >
              <q-item-section side
                ><q-btn flat round icon="content_copy" size="sm" @click="copyEmail"
              /></q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="badge" color="primary" /></q-item-section>
              <q-item-section
                ><q-item-label caption>Role</q-item-label
                ><q-item-label>{{ user?.role }}</q-item-label></q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar
                ><q-icon name="calendar_today" color="primary"
              /></q-item-section>
              <q-item-section
                ><q-item-label caption>Member Since</q-item-label
                ><q-item-label>{{ formatDate(user?.created_at) }}</q-item-label></q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="login" color="primary" /></q-item-section>
              <q-item-section
                ><q-item-label caption>Last Login</q-item-label
                ><q-item-label>{{
                  formatDate(user?.last_login) || 'N/A'
                }}</q-item-label></q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar
                ><q-icon name="circle" :color="user?.is_active ? 'green' : 'red'" size="12px"
              /></q-item-section>
              <q-item-section
                ><q-item-label caption>Account Status</q-item-label
                ><q-badge
                  :color="user?.is_active ? 'green' : 'red'"
                  :label="user?.is_active ? 'Active' : 'Inactive'"
              /></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Actions</div>
          <q-list>
            <q-item clickable v-ripple @click="showChangePassword = true">
              <q-item-section avatar><q-icon name="lock" color="warning" /></q-item-section>
              <q-item-section
                ><q-item-label>Change Password</q-item-label
                ><q-item-label caption>Update your account password</q-item-label></q-item-section
              >
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="showNotificationPrefs = true">
              <q-item-section avatar
                ><q-icon name="notifications" color="primary"
              /></q-item-section>
              <q-item-section
                ><q-item-label>Notification Preferences</q-item-label
                ><q-item-label caption
                  >Manage your notification settings</q-item-label
                ></q-item-section
              >
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="toggleDarkMode">
              <q-item-section avatar><q-icon name="palette" color="primary" /></q-item-section>
              <q-item-section
                ><q-item-label>Theme Settings</q-item-label
                ><q-item-label caption>Toggle dark mode</q-item-label></q-item-section
              >
              <q-item-section side
                ><q-toggle
                  :model-value="uiStore.isDarkMode"
                  color="primary"
                  @update:model-value="toggleDarkMode"
              /></q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
              <q-item-section
                ><q-item-label class="text-negative">Logout</q-item-label
                ><q-item-label caption>Sign out of your account</q-item-label></q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- App Info -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">About</div>
          <q-list>
            <q-item
              ><q-item-section><q-item-label>App Version</q-item-label></q-item-section
              ><q-item-section side
                ><q-item-label caption>v{{ appVersion }}</q-item-label></q-item-section
              ></q-item
            >
            <q-item
              ><q-item-section><q-item-label>Sync Status</q-item-label></q-item-section
              ><q-item-section side
                ><q-badge
                  :color="syncStore.hasPendingChanges ? 'orange' : 'green'"
                  :label="syncStore.hasPendingChanges ? 'Pending' : 'Synced'" /></q-item-section
            ></q-item>
            <q-item v-if="syncStore.lastSyncAt"
              ><q-item-section><q-item-label>Last Synced</q-item-label></q-item-section
              ><q-item-section side
                ><q-item-label caption>{{
                  formatDate(syncStore.lastSyncAt)
                }}</q-item-label></q-item-section
              ></q-item
            >
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePassword" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section><div class="text-h6">Change Password</div></q-card-section>
        <q-card-section>
          <ChangePasswordForm
            :loading="changingPassword"
            :error-message="passwordError"
            :success-message="passwordSuccess"
            @submit="handleChangePassword"
            @cancel="showChangePassword = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Notification Preferences Dialog -->
    <q-dialog v-model="showNotificationPrefs">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Notification Preferences</div></q-card-section>
        <q-card-section>
          <NotificationPreferences
            :preferences="preferences"
            @update-preference="handleUpdatePreference"
          />
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn flat label="Close" color="primary" v-close-popup
        /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth.store'
import { useSyncStore } from '../../stores/sync.store'
import { useUiStore } from '../../stores/ui.store'
import { useNotificationStore } from '../../stores/notification.store'
import { formatDate } from '../../utils/date.utils'
import ChangePasswordForm from '../../components/auth/ChangePasswordForm.vue'
import NotificationPreferences from '../../components/notification/NotificationPreferences.vue'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUiStore()
const notificationStore = useNotificationStore()

const user = computed(() => authStore.user)
const displayName = computed(
  () => user.value?.email?.split('@')[0]?.replace(/[._]/g, ' ') || 'User'
)
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0')

const showChangePassword = ref(false)
const showNotificationPrefs = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const preferences = ref([
  {
    type: 'WORKFLOW',
    label: 'Workflow Updates',
    description: 'Approval requests and status changes',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'INCIDENT',
    label: 'Incident Alerts',
    description: 'New incidents and status updates',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'RISK',
    label: 'Risk Alerts',
    description: 'Risk threshold breaches',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'COMPLIANCE',
    label: 'Compliance Reminders',
    description: 'Audit due dates',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'SYSTEM',
    label: 'System Notifications',
    description: 'Maintenance and sync updates',
    in_app: true,
    email: false,
    push: false,
  },
])

async function handleChangePassword(data: any): Promise<void> {
  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  try {
    await authStore.changePassword(data.currentPassword, data.newPassword)
    passwordSuccess.value = 'Password changed successfully!'
    setTimeout(() => {
      showChangePassword.value = false
      passwordSuccess.value = ''
    }, 1500)
  } catch (err: any) {
    passwordError.value = err.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

function handleUpdatePreference(pref: any): void {
  notificationStore.updatePreference(pref).catch(console.error)
}
function toggleDarkMode(): void {
  uiStore.toggleDarkMode()
}
function copyEmail(): void {
  if (user.value?.email) {
    navigator.clipboard.writeText(user.value.email)
    $q.notify({ type: 'positive', message: 'Copied!', timeout: 1500 })
  }
}

async function handleLogout(): Promise<void> {
  $q.dialog({ title: 'Logout', message: 'Are you sure?', cancel: true }).onOk(async () => {
    await authStore.logout()
    await router.push('/auth/login')
  })
}
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
