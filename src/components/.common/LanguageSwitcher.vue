<template>
  <q-btn-dropdown
    :label="currentLanguage.label"
    :icon="currentLanguage.flag"
    flat
    dense
    no-caps
    dropdown-icon="arrow_drop_down"
  >
    <q-list>
      <q-item-label header>{{ $t('settings.language') }}</q-item-label>

      <q-item
        v-for="lang in SUPPORTED_LANGUAGES"
        :key="lang.code"
        clickable
        v-close-popup
        :active="currentLocale === lang.code"
        active-class="text-primary bg-primary-1"
        @click="changeLanguage(lang.code)"
      >
        <q-item-section avatar>
          <span class="text-h6">{{ lang.flag }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lang.nativeLabel || lang.label }}</q-item-label>
          <q-item-label caption>{{ lang.code.toUpperCase() }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="currentLocale === lang.code">
          <q-icon name="check" color="primary" size="sm" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES, setLanguage, getCurrentLanguageDefinition } from '../../boot/i18n'
import type { SupportedLocale } from '../../boot/i18n'

const { locale } = useI18n()

const currentLocale = computed<SupportedLocale>(() => locale.value as SupportedLocale)

const currentLanguage = computed(() => {
  return getCurrentLanguageDefinition()
})

async function changeLanguage(code: SupportedLocale): Promise<void> {
  await setLanguage(code)
}
</script>

<style lang="scss" scoped>
.q-item__label--caption {
  font-size: 11px;
  opacity: 0.7;
}
</style>
