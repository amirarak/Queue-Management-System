import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

export function useTime() {
  const { locale } = useI18n()
  const currentTime = ref(new Date())
  let timer = null

  onMounted(() => {
    timer = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  })

  const formattedDate = computed(() => {
    const loc = locale.value === 'en' ? 'en-US' : locale.value === 'ky' ? 'ky-KG' : 'ru-RU'
    return currentTime.value.toLocaleDateString(loc, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  })


  function formatLocalTime(utcDateStr) {
    if (!utcDateStr) return ''
    return new Date(utcDateStr).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return { currentTime, formattedTime, formattedDate, formatLocalTime }
}