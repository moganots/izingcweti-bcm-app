<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-input
      v-model="form.currentPassword"
      label="Current Password"
      :type="showCurrent ? 'text' : 'password'"
      outlined
      dense
      :rules="[requiredRule]"
      :disable="loading"
    >
      <template v-slot:append>
        <q-icon
          :name="showCurrent ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showCurrent = !showCurrent"
        />
      </template>
    </q-input>

    <q-input
      v-model="form.newPassword"
      label="New Password"
      :type="showNew ? 'text' : 'password'"
      outlined
      dense
      :rules="passwordRules"
      :disable="loading"
    >
      <template v-slot:append>
        <q-icon
          :name="showNew ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showNew = !showNew"
        />
      </template>
    </q-input>

    <q-input
      v-model="form.confirmPassword"
      label="Confirm New Password"
      :type="showConfirm ? 'text' : 'password'"
      outlined
      dense
      :rules="[requiredRule, confirmRule]"
      :disable="loading"
    >
      <template v-slot:append>
        <q-icon
          :name="showConfirm ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showConfirm = !showConfirm"
        />
      </template>
    </q-input>

    <!-- Password Strength -->
    <div v-if="form.newPassword">
      <q-linear-progress :value="strength" :color="strengthColor" class="q-mb-xs" />
      <span class="text-caption">{{ strengthLabel }}</span>
    </div>

    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>{{
      errorMessage
    }}</q-banner>
    <q-banner v-if="successMessage" class="bg-green-1 text-green-8 rounded-borders" rounded>{{
      successMessage
    }}</q-banner>

    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
      </div>
      <div class="col-6">
        <q-btn
          type="submit"
          color="primary"
          label="Change Password"
          :loading="loading"
          class="full-width"
          unelevated
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

defineProps<{ loading?: boolean; errorMessage?: string; successMessage?: string }>()
const emit = defineEmits<{ submit: [data: any]; cancel: [] }>()

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

const strength = computed(() => {
  const p = form.newPassword
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s += 0.25
  if (p.length >= 12) s += 0.25
  if (/[A-Z]/.test(p)) s += 0.25
  if (/[0-9]/.test(p)) s += 0.25
  return Math.min(s, 1)
})

const strengthColor = computed(() =>
  strength.value < 0.3 ? 'red' : strength.value < 0.6 ? 'orange' : 'green'
)
const strengthLabel = computed(() =>
  strength.value < 0.3 ? 'Weak' : strength.value < 0.6 ? 'Fair' : 'Strong'
)

const requiredRule = (val: string) => !!val || 'Required'
const passwordRules = [
  requiredRule,
  (v: string) => v.length >= 8 || 'Min 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Need uppercase',
  (v: string) => /[0-9]/.test(v) || 'Need number',
]
const confirmRule = (v: string) => v === form.newPassword || 'Passwords do not match'

function handleSubmit(): void {
  if (!form.currentPassword || !form.newPassword || form.newPassword !== form.confirmPassword)
    return
  emit('submit', { ...form })
}
</script>
