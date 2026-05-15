<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Language</div>
      <q-list>
        <q-item
          v-for="lang in languages"
          :key="lang.code"
          clickable
          v-ripple
          :active="modelValue === lang.code"
          active-class="text-primary bg-primary-1"
          @click="$emit('update:modelValue', lang.code)"
        >
          <q-item-section avatar>
            <span class="text-h5">{{ lang.flag }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ lang.nativeLabel }}</q-item-label>
            <q-item-label caption>{{ lang.label }} ({{ lang.code.toUpperCase() }})</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon v-if="modelValue === lang.code" name="check" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const languages = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇵🇹' },
  { code: 'zu', label: 'Zulu', nativeLabel: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans', flag: '🇿🇦' },
]
</script>
