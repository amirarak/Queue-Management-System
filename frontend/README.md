# University Queue Management System

Электронная система управления очередью для университета с тремя режимами работы: киоск для студентов, электронное табло и панель сотрудника.

##  Технологии

- **Vue 3** (Composition API)
- **Vite** - сборщик проекта
- **Vue Router** - маршрутизация
- **Pinia** - управление состоянием
- **Чистый CSS** - стилизация без UI-библиотек

##  Установка
```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build

# Предварительный просмотр production-сборки
npm run preview
```

##  Структура проекта
```
src/
├── assets/          # Статические ресурсы и стили
├── components/      # Vue компоненты
│   ├── common/      # Общие компоненты
│   ├── kiosk/       # Компоненты киоска
│   ├── display/     # Компоненты табло
│   └── staff/       # Компоненты панели сотрудника
├── composables/     # Переиспользуемая логика
├── constants/       # Константы приложения
├── router/          # Конфигурация маршрутизации
├── stores/          # Pinia stores
├── utils/           # Вспомогательные функции
├── views/           # Страницы приложения
├── App.vue          # Корневой компонент
└── main.js          # Точка входа
```

##  Функциональность

### Киоск для студентов
- Приветственный экран
- Выбор услуги из списка
- Автоматическая генерация номера талона
- Отображение информации о выданном талоне

### Электронное табло
- Отображение текущего обслуживаемого номера
- Список ожидающих в очереди
- История недавно вызванных номеров
- Живые часы и дата

### Панель сотрудника
- Статистика: количество в очереди и обслуженных
- Управление текущим клиентом
- Кнопка вызова следующего
- Кнопка завершения обслуживания
- Полный список очереди

##  Цветовая схема

- **Основной**: `#1a2332` (тёмно-синий)
- **Акцент**: `#dc2626` (красный)
- **Фон**: `#ffffff` (белый)
- **Серый**: `#f5f5f5`, `#999999`, `#666666`

##  Подключение Backend

Для подключения backend достаточно модифицировать методы в `src/stores/queueStore.js`:
```javascript
// Вместо локального состояния
async function generateTicket(studentName, purpose) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, purpose })
  })
  const ticket = await response.json()
  tickets.value.push(ticket)
  return ticket
}
```

##  Лицензия

MIT

##  Автор

Разработано для учебной части университета
```

---

### **26. `.gitignore`**
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?