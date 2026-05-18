// src/boot/i18n.ts

import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from './../i18n'
import { LocalStorage } from 'quasar'

/**
 * Supported language codes type
 */
export type SupportedLocale = 'en' | 'zu'

/**
 * Language definition interface
 */
export interface LanguageDefinition {
  code: SupportedLocale
  label: string
  flag: string
  nativeLabel?: string
}

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: 'GB' },
  { code: 'zu', label: 'Zulu', nativeLabel: 'isiZulu', flag: '🇿🇦' },
] as const

/**
 * Get default locale based on saved preference or browser
 */
function getDefaultLocale(): SupportedLocale {
  // Check saved preference
  const saved = LocalStorage.getItem<string>('bcm_language')
  if (saved && isSupportedLocale(saved)) {
    return saved
  }

  // Detect from browser
  const browserLang = navigator.language.split('-')[0]
  if (isSupportedLocale(browserLang!)) {
    return browserLang
  }

  return 'en'
}

/**
 * Type guard to check if a string is a supported locale
 */
function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LANGUAGES.some((l) => l.code === locale)
}

/**
 * Create i18n instance
 */
const i18n = createI18n({
  locale: getDefaultLocale(),
  legacy: false,
  fallbackLocale: 'en' as SupportedLocale,
  messages,
  silentTranslationWarn: import.meta.env.PROD,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    zu: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
  numberFormats: {
    en: {
      currency: { style: 'currency', currency: 'ZAR' },
      percent: { style: 'percent', minimumFractionDigits: 1 },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
    },
    zu: {
      currency: { style: 'currency', currency: 'ZAR' },
      percent: { style: 'percent', minimumFractionDigits: 1 },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
    },
  },
})

/**
 * Change language with type-safe locale parameter
 */
export async function setLanguage(locale: SupportedLocale): Promise<void> {
  if (isSupportedLocale(locale)) {
    i18n.global.locale.value = locale
    LocalStorage.set('bcm_language', locale)
    document.documentElement.setAttribute('lang', locale)
  } else {
    console.warn(`Unsupported locale: ${locale}. Falling back to 'en'.`)
    i18n.global.locale.value = 'en'
    LocalStorage.set('bcm_language', 'en')
    document.documentElement.setAttribute('lang', 'en')
  }
}

/**
 * Get current language code
 */
export function getCurrentLanguage(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}

/**
 * Get current language definition
 */
export function getCurrentLanguageDefinition(): LanguageDefinition {
  const code = getCurrentLanguage()
  return SUPPORTED_LANGUAGES?.find((l) => l.code === code)! || SUPPORTED_LANGUAGES[0]
}

/**
 * Get supported language codes
 */
export function getSupportedLocales(): SupportedLocale[] {
  return SUPPORTED_LANGUAGES.map((l) => l.code)
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  return isSupportedLocale(locale)
}

export default boot(({ app }) => {
  app.use(i18n)
  document.documentElement.setAttribute('lang', i18n.global.locale.value)
})

export { i18n }
