import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'
import { Preferences } from '@capacitor/preferences'

export interface LocaleInfo {
  code: string
  name: string
  nativeName: string
  currencyCode: string
  currencySymbol: string
  direction: 'ltr' | 'rtl'
}

export const useLocaleStore = defineStore('locale', () => {
  const $q = useQuasar()
  const currentLocale = ref<string>('en-ZA')
  const isCapacitor = Capacitor.isNativePlatform()

  const availableLocales: LocaleInfo[] = [
    {
      code: 'en-ZA',
      name: 'English (South Africa)',
      nativeName: 'English',
      currencyCode: 'ZAR',
      currencySymbol: 'R',
      direction: 'ltr',
    },
    {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      currencyCode: 'USD',
      currencySymbol: '$',
      direction: 'ltr',
    },
    {
      code: 'en-GB',
      name: 'English (UK)',
      nativeName: 'English',
      currencyCode: 'GBP',
      currencySymbol: '£',
      direction: 'ltr',
    },
    {
      code: 'af-ZA',
      name: 'Afrikaans (South Africa)',
      nativeName: 'Afrikaans',
      currencyCode: 'ZAR',
      currencySymbol: 'R',
      direction: 'ltr',
    },
    {
      code: 'zu-ZA',
      name: 'Zulu (South Africa)',
      nativeName: 'isiZulu',
      currencyCode: 'ZAR',
      currencySymbol: 'R',
      direction: 'ltr',
    },
  ]

  /**
   * Get saved locale from storage
   */
  async function getSavedLocale(): Promise<string | null> {
    try {
      if (isCapacitor) {
        const { value } = await Preferences.get({ key: 'app_locale' })
        return value
      }
      return localStorage.getItem('app_locale')
    } catch (error) {
      console.error('Failed to get saved locale:', error)
      return null
    }
  }

  /**
   * Save locale to storage
   */
  async function saveLocale(locale: string): Promise<void> {
    try {
      if (isCapacitor) {
        await Preferences.set({ key: 'app_locale', value: locale })
      } else {
        localStorage.setItem('app_locale', locale)
      }
    } catch (error) {
      console.error('Failed to save locale:', error)
    }
  }

  /**
   * Detect device locale - uses Quasar's built-in method[citation:6]
   */
  async function detectDeviceLocale(): Promise<string> {
    if (isCapacitor) {
      try {
        const { value } = await Device.getLanguageCode()
        return mapToSupportedLocale(value || 'en-ZA')
      } catch {
        return 'en-ZA'
      }
    }
    // For web, use Quasar's getLocale() which returns browser/OS locale[citation:6]
    const browserLocale = $q.lang.getLocale()
    return mapToSupportedLocale(browserLocale!)
  }

  /**
   * Map any locale code to supported format
   */
  function mapToSupportedLocale(localeCode: string): string {
    const lowerCode = localeCode.toLowerCase()

    // Check for exact match first
    const exactMatch = availableLocales.find((l) => l.code.toLowerCase() === lowerCode)
    if (exactMatch) return exactMatch.code

    // Check base language matches
    if (lowerCode.startsWith('en')) {
      if (lowerCode.includes('za') || lowerCode === 'en') return 'en-ZA'
      if (lowerCode.includes('gb') || lowerCode.includes('uk')) return 'en-GB'
      return 'en-US'
    }
    if (lowerCode.startsWith('af')) return 'af-ZA'
    if (lowerCode.startsWith('zu')) return 'zu-ZA'

    return 'en-ZA' // Default fallback
  }

  /**
   * Initialize locale - priority: saved > device > default
   */
  async function initLocale(): Promise<string> {
    const saved = await getSavedLocale()
    if (saved && availableLocales.some((l) => l.code === saved)) {
      currentLocale.value = saved
      await setQuasarLanguage(saved)
      return saved
    }

    const deviceLocale = await detectDeviceLocale()
    currentLocale.value = deviceLocale
    await saveLocale(deviceLocale)
    await setQuasarLanguage(deviceLocale)

    return deviceLocale
  }

  /**
   * Change locale manually
   */
  async function setLocale(localeCode: string): Promise<void> {
    const found = availableLocales.find((l) => l.code === localeCode)
    if (!found) return

    currentLocale.value = localeCode
    await saveLocale(localeCode)
    await setQuasarLanguage(localeCode)

    // Update document direction for RTL support
    document.documentElement.dir = found.direction
    document.documentElement.lang = localeCode.split('-')[0]!
  }

  /**
   * Set Quasar's built-in component language
   * Note: Quasar.lang.getLocale() returns system locale, not this set value[citation:6]
   * To check what Quasar language is set, use $q.lang.isoName[citation:6]
   */
  async function setQuasarLanguage(localeCode: string): Promise<void> {
    const langPackMap: Record<string, string> = {
      'en-ZA': 'en-US',
      'en-US': 'en-US',
      'en-GB': 'en-GB',
      'af-ZA': 'af',
      'zu-ZA': 'en-US', // Zulu may need custom pack
    }

    const packName = langPackMap[localeCode] || 'en-US'

    try {
      const langModule = await import(`quasar/lang/${packName}`)
      $q.lang.set(langModule.default)
    } catch (error) {
      console.warn(`Failed to load ${packName}, using en-US`)
      const fallback = await import('quasar/lang/en-US')
      $q.lang.set(fallback.default)
    }
  }

  /**
   * Format currency with proper South African Rand support
   */
  function formatCurrency(amount: number, customLocale?: string): string {
    const locale = customLocale || currentLocale.value
    const localeInfo = availableLocales.find((l) => l.code === locale)
    const currency = localeInfo?.currencyCode || 'ZAR'

    // For ZAR, we can use en-ZA locale for proper formatting
    const formatLocale = currency === 'ZAR' ? 'en-ZA' : locale

    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Get current currency symbol
   */
  const currentCurrencySymbol = computed(() => {
    const localeInfo = availableLocales.find((l) => l.code === currentLocale.value)
    return localeInfo?.currencySymbol || 'R'
  })

  /**
   * Get current currency code
   */
  const currentCurrencyCode = computed(() => {
    const localeInfo = availableLocales.find((l) => l.code === currentLocale.value)
    return localeInfo?.currencyCode || 'ZAR'
  })

  /**
   * Format number with locale-specific thousands separators
   * en-ZA uses spaces for thousands: 1 000 000.00[citation:6]
   */
  function formatNumber(amount: number): string {
    return new Intl.NumberFormat(currentLocale.value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return {
    currentLocale,
    availableLocales,
    currentCurrencySymbol,
    currentCurrencyCode,
    isCapacitor,
    initLocale,
    setLocale,
    detectDeviceLocale,
    formatCurrency,
    formatNumber,
  }
})
