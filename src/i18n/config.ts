import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      
      // Automatic detection based on browser/location
      convertDetectedLanguage: (lng: string) => {
        // Map regional codes to our supported languages
        if (lng.startsWith('pt')) return 'pt';
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('es')) return 'es';
        if (lng.startsWith('fr')) return 'fr';
        
        // Default to Portuguese for unsupported languages
        return 'pt';
      },
    },
  });

export default i18n;