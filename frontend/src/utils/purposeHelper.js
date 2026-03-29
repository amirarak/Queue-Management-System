import { useI18n } from 'vue-i18n'


export function usePurpose() {
  const { t } = useI18n()

  function translatePurpose(purposeKey) {
    if (!purposeKey) return '—'
    if (purposeKey.startsWith('services.')) {
      return t(purposeKey)
    }
    return purposeKey
  }

  return { translatePurpose }
}