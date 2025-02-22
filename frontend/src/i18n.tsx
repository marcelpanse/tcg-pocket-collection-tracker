import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
  })

export default i18n
