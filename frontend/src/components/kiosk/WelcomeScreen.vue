<template>
  <div class="welcome-screen">
    <img src="@/assets/images/uni.logo.png" alt="University Logo" class="university-logo" />

    <h2 class="welcome-title">Добро пожаловать!</h2>
    <p class="welcome-text">
      Нажмите на экран, чтобы получить номер очереди
    </p>
    
    <button class="start-button" @click="$emit('start')">
      Начать
    </button>
  </div>
</template>

<style scoped>
/* Стили для родительского контейнера, чтобы всё было по центру */
.welcome-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%; /* Или другая высота в зависимости от родителя */
  animation: fadeIn 0.5s ease-in;
}

.university-logo {
  width: 250px;       /* Увеличьте размер согласно фото */
  height: auto;       /* Сохраняем пропорции */
  margin-bottom: 40px; 
  display: block;
  /* Если у картинки есть белый фон, который нужно скрыть: */
  border-radius: 50%; 
}

.welcome-title {
  color: white;
  font-size: 64px;    /* На фото заголовок выглядит очень массивно */
  margin: 0 0 20px;
  font-weight: 800;
}

.welcome-text {
  color: #c5c5c5;     /* Светло-серый оттенок как на фото */
  font-size: 26px;
  margin: 0 0 80px;
  font-weight: 300;   /* Текст под заголовком обычно тоньше */
}

.start-button {
  padding: 25px 90px;
  font-size: 32px;
  font-weight: 700;
  color: white;
  background-color: #d32f2f; /* Насыщенный красный */
  border: none;
  border-radius: 15px;      /* Скругление кнопок */
  cursor: pointer;
  text-transform: uppercase;
}
</style>