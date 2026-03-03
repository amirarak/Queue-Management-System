import { createI18n } from 'vue-i18n'
import ru from '../locales/ru'
import ky from '../locales/ky'
import en from '../locales/en'

const savedLocale = localStorage.getItem('locale') || 'ru'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'ru',
  messages: { ru, ky, en }
})

export default i18n