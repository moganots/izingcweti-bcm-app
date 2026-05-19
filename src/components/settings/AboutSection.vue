<template>
  <q-card flat bordered>
    <q-card-section class="text-center">
      <q-icon name="shield" size="48px" color="primary" class="q-mb-md" />
      <div class="text-h6">Izingcweti BCM App</div>
      <div class="text-caption text-grey-7 q-mb-md">Business Continuity Management</div>
      <div class="text-caption text-grey-6">Version {{ version }}</div>
      <div class="text-caption text-grey-6">Build {{ buildNumber }}</div>
      <div class="text-caption text-grey-6 q-mt-sm">{{ environment }} Environment</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="center">
      <q-btn flat color="primary" label="Privacy Policy" @click="$emit('privacy-policy')" />
      <q-btn flat color="primary" label="Terms of Service" @click="$emit('terms')" />
      <q-btn flat color="primary" label="Licenses" @click="$emit('licenses')" />
    </q-card-actions>
    <q-card-actions align="center">
      <q-btn flat color="grey" icon="bug_report" label="Report Bug" @click="$emit('report-bug')" />
      <q-btn
        flat
        color="grey"
        icon="lightbulb"
        label="Feature Request"
        @click="$emit('feature-request')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    version?: string
    buildNumber?: string
    environment?: string
  }>(),
  {
    version: '1.0.0',
    buildNumber: '1',
    environment: 'Development',
  }
)

defineEmits<{
  'privacy-policy': []
  terms: []
  licenses: []
  'report-bug': []
  'feature-request': []
}>()
</script>
