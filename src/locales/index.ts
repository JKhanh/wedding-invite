import { vi } from './vi'
import { en } from './en'

export type Language = 'vi' | 'en'

// All translations
export const translations = {
  vi,
  en,
}

// Helper function to get nested translation by key path
export const getTranslation = (language: Language, keyPath: string): string => {
  const keys = keyPath.split('.')
  let translation: any = translations[language]
  
  for (const key of keys) {
    if (translation && typeof translation === 'object' && key in translation) {
      translation = translation[key]
    } else {
      // Fallback to Vietnamese if English translation is missing
      if (language === 'en') {
        let fallback: any = translations.vi
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey]
          } else {
            return keyPath // Return key path if translation not found
          }
        }
        return fallback
      }
      return keyPath // Return key path if translation not found
    }
  }
  
  return typeof translation === 'string' ? translation : keyPath
}

// Create translation function for a specific language
export const createTranslationFunction = (language: Language) => {
  return (keyPath: string): string => getTranslation(language, keyPath)
}

// Default language
export const DEFAULT_LANGUAGE: Language = 'vi'

// Available languages
export const AVAILABLE_LANGUAGES: { code: Language; name: string }[] = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
]

export { vi, en }