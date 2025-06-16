import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AVAILABLE_LANGUAGES } from '@/locales'

interface LanguageSwitcherProps {
  className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          className="inline-block w-4 h-4 stroke-current"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="ml-1">
          {AVAILABLE_LANGUAGES.find(lang => lang.code === language)?.name}
        </span>
      </div>
      <ul 
        tabIndex={0} 
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <a
              onClick={() => setLanguage(lang.code)}
              className={`${language === lang.code ? 'active' : ''}`}
            >
              {lang.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LanguageSwitcher