<template>
  <div class="profile-page">
    <!-- Mobile Header -->
    <div class="profile-header q-pa-md q-mb-md">
      <div class="row items-center">
        <q-avatar size="56px" class="q-mr-md">
          <q-icon name="person" size="32px" />
        </q-avatar>
        <div>
          <div class="text-h6">{{ fullName }}</div>
          <div class="text-caption text-grey-7">{{ user?.email }}</div>
        </div>
        <q-space />
        <q-btn flat round color="grey" icon="more_vert" @click="showMenu = true" />
      </div>
    </div>

    <div class="profile-content">
      <q-list bordered separator class="rounded-borders">
        <!-- Personal Info -->
        <q-item-label header class="text-subtitle2">{{ $t('profile.title') }}</q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="person" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('profile.fullName') }}</q-item-label>
            <q-item-label>{{ fullName || 'N/A' }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="email" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('profile.email') }}</q-item-label>
            <q-item-label>{{ user?.email }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="badge" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('profile.role') }}</q-item-label>
            <q-item-label>{{ user?.role }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="business" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('profile.organisation') }}</q-item-label>
            <q-item-label>{{ organisationName || 'N/A' }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="phone" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('profile.phone') }}</q-item-label>
            <q-item-label>{{ user?.phoneNumber || 'Not set' }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <!-- Account Actions -->
        <q-item-label header class="text-subtitle2">{{ $t('profile.account') }}</q-item-label>

        <q-item clickable @click="showChangePassword = true">
          <q-item-section avatar>
            <q-icon name="lock" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>{{ $t('profile.changePassword') }}</q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" size="20px" color="grey" />
          </q-item-section>
        </q-item>

        <q-item clickable @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" size="20px" />
          </q-item-section>
          <q-item-section class="text-negative">{{ $t('profile.logout') }}</q-item-section>
        </q-item>
      </q-list>

      <!-- Action Buttons -->
      <div class="row q-col-gutter-sm q-mt-md">
        <div class="col-6">
          <q-btn
            flat
            color="primary"
            :label="$t('profile.edit')"
            class="full-width"
            @click="showEditDialog = true"
          />
        </div>
        <div class="col-6">
          <q-btn
            flat
            color="grey"
            :label="$t('app.refresh')"
            class="full-width"
            :loading="refreshing"
            @click="refreshProfile"
          />
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="showEditDialog" full-width>
      <q-card style="width: 100%; max-width: 500px;">
        <q-card-section>
          <div class="text-h6">{{ $t('profile.edit') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="scroll" style="max-height: 70vh;">
          <q-form @submit.prevent="handleUpdateProfile" class="q-gutter-md">
            <q-input
              v-model="profileForm.firstName"
              :label="$t('profile.firstName')"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="profileForm.lastName"
              :label="$t('profile.lastName')"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="profileForm.phoneNumber"
              :label="$t('profile.phone')"
              outlined
              dense
              type="tel"
            />

            <div class="text-subtitle2 q-mt-md">{{ $t('profile.preferences') }}</div>
            <q-separator class="q-mb-md" />

            <q-select
              v-model="profileForm.theme"
              :options="themeOptions"
              :label="$t('profile.theme')"
              outlined
              dense
            />
            <q-select
              v-model="profileForm.language"
              :options="languageOptions"
              :label="$t('profile.language')"
              outlined
              dense
            />

            <div class="text-subtitle2 q-mt-md">{{ $t('profile.notifications') }}</div>
            <q-separator class="q-mb-md" />

            <q-toggle
              v-model="profileForm.notifications.email"
              :label="$t('profile.emailNotifications')"
            />
            <q-toggle
              v-model="profileForm.notifications.push"
              :label="$t('profile.pushNotifications')"
            />
            <q-toggle
              v-model="profileForm.notifications.sms"
              :label="$t('profile.smsNotifications')"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn
                flat
                :label="$t('app.cancel')"
                color="grey"
                @click="showEditDialog = false"
              />
              <q-btn
                type="submit"
                color="primary"
                :label="$t('app.save')"
                :loading="saving"
                unelevated
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePassword" full-width>
      <q-card style="width: 100%; max-width: 500px;">
        <q-card-section>
          <div class="text-h6">{{ $t('profile.changePassword') }}</div>
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

    <!-- Menu Dialog -->
    <q-dialog v-model="showMenu" position="bottom" full-width>
      <q-card style="border-radius: 16px 16px 0 0;">
        <q-card-section>
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <q-icon name="person" size="24px" />
            </q-avatar>
            <div>
              <div class="text-subtitle1">{{ fullName }}</div>
              <div class="text-caption text-grey-6">{{ user?.email }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-list>
          <q-item clickable @click="showEditDialog = true; showMenu = false">
            <q-item-section avatar><q-icon name="edit" color="primary" /></q-item-section>
            <q-item-section>{{ $t('profile.edit') }}</q-item-section>
          </q-item>
          <q-item clickable @click="showChangePassword = true; showMenu = false">
            <q-item-section avatar><q-icon name="lock" color="primary" /></q-item-section>
            <q-item-section>{{ $t('profile.changePassword') }}</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable @click="handleLogout">
            <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
            <q-item-section class="text-negative">{{ $t('profile.logout') }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { ChangePasswordForm } from 'src/components/auth'
import type { User } from 'src/models/entities/user/user.entity'

const router = useRouter()
const $q = useQuasar()

// ============================================
// Auth Composable
// ============================================
const { user, updateProfile, changePassword, logout, fetchProfile } = useAuth()

// ============================================
// Local State
// ============================================
const showEditDialog = ref(false)
const showChangePassword = ref(false)
const showMenu = ref(false)
const saving = ref(false)
const refreshing = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const organisationName = ref('')

// ============================================
// Computed
// ============================================
const fullName = computed(() => {
  if (!user.value) return 'User'
  if (user.value.firstName && user.value.lastName) {
    return `${user.value.firstName} ${user.value.lastName}`
  }
  return user.value.email?.split('@')[0] || 'User'
})

// ============================================
// Profile Form
// ============================================
const profileForm = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
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

// ============================================
// Methods
// ============================================
function loadUserData(): void {
  if (user.value) {
    const u = user.value as User
    profileForm.firstName = u.firstName || ''
    profileForm.lastName = u.lastName || ''
    profileForm.phoneNumber = u.phoneNumber || ''

    if (u.preferences) {
      profileForm.theme = u.preferences.theme || 'light'
      profileForm.language = u.preferences.language || 'en'
      if (u.preferences.notifications) {
        profileForm.notifications = {
          ...profileForm.notifications,
          ...u.preferences.notifications,
        }
      }
    }

    organisationName.value = u.organisation?.name || 'N/A'
  }
}

async function refreshProfile(): Promise<void> {
  refreshing.value = true
  try {
    await fetchProfile()
    loadUserData()
    $q.notify({
      type: 'positive',
      message: 'Profile refreshed',
      position: 'top',
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to refresh profile',
      position: 'top',
    })
  } finally {
    refreshing.value = false
  }
}

async function handleUpdateProfile(): Promise<void> {
  saving.value = true

  try {
    await updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phoneNumber: profileForm.phoneNumber,
      preferences: {
        theme: profileForm.theme,
        language: profileForm.language,
        notifications: profileForm.notifications,
      },
    })

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top',
    })

    showEditDialog.value = false
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

async function handleChangePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await changePassword(data.currentPassword, data.newPassword)

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

async function handleLogout(): Promise<void> {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await logout()
    router.push({ name: 'Login' })
  })
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  if (user.value) {
    loadUserData()
  }
})

watch(
  () => user.value,
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
  max-width: 500px;
  margin: 0 auto;
  padding: 8px 12px;

  @media (max-width: 400px) {
    padding: 4px 8px;
  }
}

.profile-header {
  background: $grey-3;
  border-radius: 12px;
  color: white;

  .text-h6 {
    font-size: 1.125rem;
    margin-bottom: 2px;
  }

  .text-caption {
    color: white;
    opacity: 0.8;
  }
}

.profile-content {
  :deep(.q-item) {
    min-height: 48px;
    padding: 8px 16px;

    @media (max-width: 400px) {
      padding: 6px 12px;
      min-height: 44px;
    }
  }

  :deep(.q-item-label--header) {
    padding: 8px 16px;
    font-size: 0.8125rem;

    @media (max-width: 400px) {
      padding: 6px 12px;
      font-size: 0.75rem;
    }
  }
}

.q-dialog {
  :deep(.q-card) {
    margin: 8px;
    max-height: 90vh;

    @media (max-width: 400px) {
      margin: 4px;
      border-radius: 12px;
    }
  }
}
</style>