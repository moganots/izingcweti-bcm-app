import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setLanguage, getCurrentLanguage } from '../boot/i18n'
import type { SupportedLocale } from '../boot/i18n'

export const useSettingsStore = defineStore('settings', () => {
  const currentLanguage = ref<SupportedLocale>(getCurrentLanguage())
  const theme = ref<'light' | 'dark' | 'system'>('system')

  async function setAppLanguage(locale: SupportedLocale): Promise<void> {
    await setLanguage(locale)
    currentLanguage.value = locale
  }

  function setTheme(newTheme: 'light' | 'dark' | 'system'): void {
    theme.value = newTheme
    // Apply theme logic
  }

  return {
    currentLanguage,
    theme,
    setAppLanguage,
    setTheme,
  }
})
