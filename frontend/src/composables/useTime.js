import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useTime() {
  const currentTime = ref(new Date())

  let timer = null

  onMounted(() => {
    timer = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  })

  const formattedDate = computed(() => {
    return currentTime.value.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  })

  return {
    currentTime,
    formattedTime,
    formattedDate
  }
}