import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, DEFAULT_LANGUAGE, getTranslation } from '@/locales'

// Language context type
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Language provider component
interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Default to Vietnamese
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('wedding-language') as Language
      if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding-language', lang)
    }
  }

  // Translation function
  const t = (keyPath: string): string => {
    return getTranslation(language, keyPath)
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext