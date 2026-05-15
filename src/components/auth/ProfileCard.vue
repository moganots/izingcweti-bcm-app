<template>
  <q-card flat bordered>
    <q-card-section class="bg-primary text-white">
      <div class="row items-center">
        <q-avatar size="64px" class="q-mr-md">
          <q-icon name="person" size="40px" />
        </q-avatar>
        <div>
          <div class="text-h6">{{ displayName }}</div>
          <q-badge color="white" text-color="primary" class="q-px-md q-py-xs">{{
            user?.role || 'User'
          }}</q-badge>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <q-list separator>
        <q-item>
          <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label caption>Email</q-item-label>
            <q-item-label>{{ user?.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round icon="content_copy" size="sm" @click="copyEmail" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar><q-icon name="badge" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label caption>Role</q-item-label>
            <q-item-label>{{ user?.role }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar><q-icon name="business" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label caption>Organisation</q-item-label>
            <q-item-label>{{ organisationName || 'N/A' }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar><q-icon name="calendar_today" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label caption>Member Since</q-item-label>
            <q-item-label>{{ formatDate(user?.created_at) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar><q-icon name="login" color="primary" /></q-item-section>
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
            <q-badge
              :color="user?.is_active ? 'green' : 'red'"
              :label="user?.is_active ? 'Active' : 'Inactive'"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="around">
      <q-btn
        flat
        color="primary"
        icon="lock"
        label="Change Password"
        @click="$emit('change-password')"
      />
      <q-btn flat color="negative" icon="logout" label="Logout" @click="$emit('logout')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'
import { getInitials } from '../../utils/formatters'

const props = defineProps<{ user?: any; organisationName?: string }>()
defineEmits<{ 'change-password': []; logout: [] }>()

const displayName = computed(
  () => props.user?.email?.split('@')[0]?.replace(/[._]/g, ' ') || 'User'
)

function copyEmail(): void {
  if (props.user?.email) navigator.clipboard.writeText(props.user.email)
}
</script>
