<template>
  <q-page padding>
    <PageHeader title="Settings" subtitle="Configure your application preferences" />

    <div class="settings-container q-gutter-md">
      <!-- Appearance Section -->
      <SettingsSection title="Appearance" icon="palette" description="Customize how the application looks">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="dark_mode" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dark Mode</q-item-label>
              <q-item-label caption>Toggle dark/light theme</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.darkMode" color="primary" @update:model-value="toggleDarkMode" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="language" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Language</q-item-label>
              <q-item-label caption>Select your preferred language</q-item-label>
            </q-item-section>
            <q-item-section side>
              <LanguageSwitcher />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="font_download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Font Size</q-item-label>
              <q-item-label caption>Adjust text size</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.fontSize"
                :options="fontSizeOptions"
                outlined
                dense
                style="width: 120px;"
                @update:model-value="saveSetting('fontSize', settings.fontSize)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Notifications Section -->
      <SettingsSection title="Notifications" icon="notifications" description="Manage how you receive notifications">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="notifications_active" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Push Notifications</q-item-label>
              <q-item-label caption>Receive push notifications on your device</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.pushEnabled" color="primary" @update:model-value="saveSetting('pushEnabled', settings.pushEnabled)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="email" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Email Notifications</q-item-label>
              <q-item-label caption>Receive notifications via email</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.emailEnabled" color="primary" @update:model-value="saveSetting('emailEnabled', settings.emailEnabled)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="$router.push('/notifications/settings')">
            <q-item-section avatar>
              <q-icon name="tune" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Notification Preferences</q-item-label>
              <q-item-label caption>Configure per-type notification settings</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Sync Section -->
      <SettingsSection title="Synchronization" icon="sync" description="Configure how data is synced">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="sync" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Auto Sync</q-item-label>
              <q-item-label caption>Automatically sync changes when online</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.autoSync" color="primary" @update:model-value="saveSetting('autoSync', settings.autoSync)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="timer" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sync Interval</q-item-label>
              <q-item-label caption>How often to sync in the background</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.syncInterval"
                :options="syncIntervalOptions"
                outlined
                dense
                style="width: 140px;"
                emit-value
                map-options
                @update:model-value="saveSetting('syncInterval', settings.syncInterval)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="signal_cellular_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sync on Cellular</q-item-label>
              <q-item-label caption>Allow sync when using mobile data</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.meteredSync" color="primary" @update:model-value="saveSetting('meteredSync', settings.meteredSync)" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Cache Section -->
      <SettingsSection title="Cache & Storage" icon="storage" description="Manage local data storage">
        <div class="q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-body2">Storage Used</span>
            <span class="text-caption text-grey-7">{{ storageInfo.used }} / {{ storageInfo.total }}</span>
          </div>
          <q-linear-progress :value="storageInfo.percentage / 100" :color="storageInfo.color" size="15px" rounded />
        </div>

        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="cached" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Enable Caching</q-item-label>
              <q-item-label caption>Store data locally for offline access</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.cacheEnabled" color="primary" @update:model-value="saveSetting('cacheEnabled', settings.cacheEnabled)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="clearCache">
            <q-item-section avatar>
              <q-icon name="cleaning_services" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clear Cache</q-item-label>
              <q-item-label caption>Remove all cached data</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="$router.push('/cache')">
            <q-item-section avatar>
              <q-icon name="storage" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Cache Management</q-item-label>
              <q-item-label caption>View and manage cached entries</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Security Section -->
      <SettingsSection title="Security" icon="security" description="Manage your account security">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="fingerprint" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Biometric Authentication</q-item-label>
              <q-item-label>>Use fingerprint or face to unlock</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.biometricEnabled" color="primary" :disable="!biometricAvailable" @update:model-value="saveSetting('biometricEnabled', settings.biometricEnabled)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="showChangePassword = true">
            <q-item-section avatar>
              <q-icon name="lock" color="warning" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Change Password</q-item-label>
              <q-item-label caption>Update your account password</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="timer_off" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Session Timeout</q-item-label>
              <q-item-label caption>Auto logout after inactivity</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.sessionTimeout"
                :options="timeoutOptions"
                outlined
                dense
                style="width: 140px;"
                emit-value
                map-options
                @update:model-value="saveSetting('sessionTimeout', settings.sessionTimeout)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="viewSessions">
            <q-item-section avatar>
              <q-icon name="devices" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Active Sessions</q-item-label>
              <q-item-label caption>Manage your active sessions</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge v-if="sessionCount > 1" color="primary" :label="String(sessionCount)" />
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Developer Section -->
      <SettingsSection v-if="showDevOptions" title="Developer" icon="bug_report" description="Development and debugging tools">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="terminal" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Debug Mode</q-item-label>
              <q-item-label caption>Enable detailed console logging</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.debugMode" color="warning" @update:model-value="saveSetting('debugMode', settings.debugMode)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="exportDatabase">
            <q-item-section avatar>
              <q-icon name="download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Export Database</q-item-label>
              <q-item-label caption>Download local database as JSON</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="importDatabase">
            <q-item-section avatar>
              <q-icon name="upload" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Import Database</q-item-label>
              <q-item-label caption>Restore database from backup</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- About Section -->
      <SettingsSection title="About" icon="info" description="Application information">
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="shield" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Izingcweti BCM</q-item-label>
              <q-item-label caption>Business Continuity Management</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-caption text-grey-7">v{{ appVersion }}</span>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item>
            <q-item-section avatar>
              <q-icon name="build" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Build Number</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-caption text-grey-7">{{ buildNumber }}</span>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item>
            <q-item-section avatar>
              <q-icon name="public" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Environment</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="envColor" :label="environment" />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-6">
            <q-btn flat color="primary" label="Privacy Policy" class="full-width" @click="openUrl('https://izingcweti-bcm.com/privacy')" />
          </div>
          <div class="col-6">
            <q-btn flat color="primary" label="Terms of Service" class="full-width" @click="openUrl('https://izingcweti-bcm.com/terms')" />
          </div>
          <div class="col-6">
            <q-btn flat color="grey" icon="bug_report" label="Report Bug" class="full-width" @click="reportBug" />
          </div>
          <div class="col-6">
            <q-btn flat color="grey" icon="lightbulb" label="Feature Request" class="full-width" @click="requestFeature" />
          </div>
        </div>
      </SettingsSection>

      <!-- Danger Zone -->
      <SettingsSection title="Danger Zone" icon="warning" description="Irreversible actions">
        <q-btn color="negative" icon="delete_forever" label="Reset All Settings" class="full-width" outline @click="confirmResetSettings" />
        <q-btn color="negative" icon="restart_alt" label="Clear All App Data" class="full-width q-mt-sm" outline @click="confirmClearData" />
      </SettingsSection>
    </div>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePassword" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { useSyncStore } from '../../stores/sync.store';
import { StorageUtils } from '../../utils/storage.utils';
import PageHeader from '../../components/.common/PageHeader.vue';
import SettingsSection from '../../components/settings/SettingsSection.vue';
import LanguageSwitcher from '../../components/.common/LanguageSwitcher.vue';
import ChangePasswordForm from '../../components/auth/ChangePasswordForm.vue';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const syncStore = useSyncStore();

// State
const showChangePassword = ref(false);
const changingPassword = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');
const biometricAvailable = ref(false);
const sessionCount = ref(1);
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0');
const buildNumber = ref(import.meta.env.VITE_BUILD_NUMBER || '1');
const environment = ref(import.meta.env.VITE_ENV_NAME || 'Development');

// Settings
const settings = reactive({
  darkMode: false,
  fontSize: 'medium',
  pushEnabled: true,
  emailEnabled: true,
  autoSync: true,
  syncInterval: 5,
  meteredSync: false,
  cacheEnabled: true,
  biometricEnabled: false,
  sessionTimeout: 30,
  debugMode: false,
});

// Options
const fontSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const syncIntervalOptions = [
  { label: '1 minute', value: 1 },
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
];

const timeoutOptions = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: 'Never', value: 0 },
];

// Computed
const showDevOptions = computed(() => environment.value !== 'Production');
const envColor = computed(() => {
  const colors: Record<string, string> = { Local: 'red', Development: 'orange', Staging: 'yellow', Production: 'green' };
  return colors[environment.value] || 'grey';
});

const storageInfo = computed(() => ({
  used: '12.5 MB',
  total: '100 MB',
  percentage: 12.5,
  color: 'green',
}));

// Lifecycle
onMounted(async () => {
  // Load saved settings
  const saved = await StorageUtils.getSettings();
  if (saved) {
    settings.darkMode = saved.theme === 'dark';
    settings.autoSync = saved.syncInterval > 0;
    settings.syncInterval = saved.syncInterval || 5;
    settings.cacheEnabled = saved.cacheEnabled !== false;
  }
  settings.darkMode = uiStore.isDarkMode;
  biometricAvailable.value = false;
});

// Methods
function toggleDarkMode(): void {
  uiStore.toggleDarkMode();
  saveSetting('darkMode', settings.darkMode);
}

function saveSetting(key: string, value: any): void {
  console.log(`Setting saved: ${key} = ${value}`);
  StorageUtils.saveSettings({ [key]: value } as any).catch(console.error);
}

function clearCache(): void {
  $q.dialog({
    title: 'Clear Cache',
    message: 'Are you sure you want to clear all cached data?',
    cancel: true,
    ok: { color: 'orange', label: 'Clear' },
  }).onOk(async () => {
    await StorageUtils.clearCache();
    $q.notify({ type: 'positive', message: 'Cache cleared successfully' });
  });
}

async function handleChangePassword(data: any): Promise<void> {
  changingPassword.value = true; passwordError.value = ''; passwordSuccess.value = '';
  try {
    await authStore.changePassword(data.currentPassword, data.newPassword);
    passwordSuccess.value = 'Password changed successfully!';
    setTimeout(() => { showChangePassword.value = false; passwordSuccess.value = ''; }, 1500);
  } catch (err: any) { passwordError.value = err.message || 'Failed to change password'; }
  finally { changingPassword.value = false; }
}

function viewSessions(): void { console.log('View sessions'); }
function exportDatabase(): void { console.log('Export database'); }
function importDatabase(): void { console.log('Import database'); }
function openUrl(url: string): void { window.open(url, '_blank'); }
function reportBug(): void { window.open('mailto:support@izingcweti-bcm.com?subject=Bug Report', '_blank'); }
function requestFeature(): void { window.open('mailto:support@izingcweti-bcm.com?subject=Feature Request', '_blank'); }

function confirmResetSettings(): void {
  $q.dialog({
    title: 'Reset Settings',
    message: 'This will reset all settings to their defaults. Continue?',
    cancel: true,
    ok: { color: 'negative', label: 'Reset' },
  }).onOk(() => {
    Object.assign(settings, {
      darkMode: false, fontSize: 'medium', pushEnabled: true, emailEnabled: true,
      autoSync: true, syncInterval: 5, meteredSync: false, cacheEnabled: true,
      biometricEnabled: false, sessionTimeout: 30, debugMode: false,
    });
    $q.notify({ type: 'positive', message: 'Settings reset to defaults' });
  });
}

function confirmClearData(): void {
  $q.dialog({
    title: 'Clear All Data',
    message: 'This will delete all local data including cached files and settings. This cannot be undone. Are you sure?',
    cancel: true,
    ok: { color: 'negative', label: 'Clear All Data' },
  }).onOk(async () => {
    await StorageUtils.clearStorage();
    $q.notify({ type: 'positive', message: 'All data cleared' });
  });
}
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 700px;
  margin: 0 auto;
}
</style>