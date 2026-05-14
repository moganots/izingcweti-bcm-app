import en from './en' // English
import zu from './zu' // Zulu

/**
 * Internationalization messages
 *
 * Supported languages:
 * - English (en) - Default
 * - Zulu (zu)
 */
const messages = {
  en,
  zu,
}

export default messages

// Re-export individual languages for direct imports
export { en, zu }
