export default {
  dept: { name: 'Учебная часть' },

  nav: {
    kiosk: 'Киоск для студентов',
    display: 'Электронное табло',
    staff: 'Панель сотрудника',
    analytics: 'Аналитика',
    staffMgmt: 'Управление'
  },

  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    save: 'Сохранить',
    cancel: 'Отмена',
    close: 'Закрыть',
    logout: 'Выйти',
    back: 'Назад',
    yes: 'Да, выйти',
    no: 'Отмена'
  },

  logout: {
    confirmTitle: 'Выход из системы',
    confirmText: 'Вы действительно хотите выйти?'
  },

  login: {
    title: 'Вход в систему',
    subtitle: 'Ala-Too International University',
    email: 'Email',
    password: 'Пароль',
    passwordPlaceholder: 'Введите пароль',
    submit: 'Войти',
    submitting: 'Вход...',
    contactAdmin: 'Для доступа обратитесь к администратору',
    emailRequired: 'Email обязателен',
    emailInvalid: 'Только почта alatoo.edu.kg',
    passwordRequired: 'Пароль обязателен',
    forgotPassword: 'Забыли пароль?',
    forgotTitle: 'Забыли пароль?',
    forgotText: 'Пароли устанавливаются через приглашение по электронной почте. Для сброса пароля свяжитесь с администратором.',
    forgotContact: 'Обратитесь к администратору системы',
    forgotClose: 'Понятно'
  },

  kiosk: {
    welcome: 'Добро пожаловать!',
    instruction: 'Нажмите на экран, чтобы получить номер очереди',
    start: 'НАЧАТЬ',
    selectService: 'Выберите услугу',
    inQueue: 'В ОЧЕРЕДИ',
    creatingTicket: 'Создаём талон...',
    queueError: 'Ошибка загрузки очереди'
  },

  services: {
    certificate: 'Справка об обучении',
    academicLeave: 'Академический отпуск',
    transfer: 'Перевод на другую специальность',
    curriculumChange: 'Изменение учебного плана',
    consultation: 'Консультация',
    other: 'Прочие вопросы'
  },

  ticket: {
    yourNumber: 'Ваш номер',
    waiting: 'Ожидайте вызова',
    minutes: 'мин'
  },

  display: {
    title: 'Электронная очередь',
    serving: 'Обслуживается',
    ticketNumber: 'Номер талона',
    waiting: 'Ожидание вызова',
    recentlyCalled: 'Недавно вызванные',
    queue: 'Очередь',
    next: 'Следующий',
    emptyQueue: 'Очередь пуста'
  },

  staff: {
    title: 'Панель управления',
    callNext: 'Вызвать следующего',
    complete: 'Завершить',
    waiting: 'Ожидают',
    served: 'Обслужено',
    currentClient: 'Текущий клиент',
    noClient: 'Нет активного клиента',
    staffRole: 'Сотрудник',
    adminRole: 'Администратор',
    createSuccess: 'Сотрудник создан! Письмо с инструкцией отправлено.',
    createError: 'Ошибка создания сотрудника'
  },

  staffMgmt: {
    title: 'Управление сотрудниками',
    addStaff: 'Добавить сотрудника',
    editStaff: 'Редактировать сотрудника',
    fullName: 'ФИО',
    emailLabel: 'Email',
    role: 'Роль',
    status: 'Статус',
    lastLogin: 'Последний вход',
    actions: 'Действия',
    active: 'Активен',
    inactive: 'Деактивирован',
    edit: 'Редактировать',
    deactivate: 'Деактивировать',
    activate: 'Активировать',
    delete: 'Удалить',
    confirmDelete: 'Подтвердите удаление',
    confirmDeleteText: 'Вы уверены, что хотите удалить сотрудника',
    updateSuccess: 'Данные обновлены!',
    logout: 'Выйти',
    emailNote: 'Сотрудник получит письмо для установки пароля'
  },

  analytics: {
    title: 'Аналитика и статистика',
    export: 'Экспорт отчёта',
    period: 'Период',
    today: 'Сегодня',
    week: 'Неделя',
    month: 'Месяц',
    custom: 'Выбрать даты',
    from: 'С',
    to: 'По',
    apply: 'Применить',
    totalTickets: 'Всего талонов',
    served: 'Обслужено',
    avgWait: 'Среднее время ожидания',
    avgService: 'Среднее время обслуживания',
    peakHour: 'Пиковый час',
    tickets: 'талонов',
    hourlyChart: 'Распределение по часам',
    staffStats: 'Статистика по сотрудникам',
    staffName: 'Сотрудник',
    ticketsServed: 'Обслужено',
    avgServiceShort: 'Ср. время',
    topServices: 'Популярные услуги',
    noData: 'Нет данных за этот период'
  },

  profile: {
    title: 'Профиль',
    back: 'Назад',
    personalData: 'Личные данные',
    fullName: 'Полное имя',
    email: 'Email',
    emailHint: 'Email изменить нельзя',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение...',
    saveSuccess: 'Данные успешно обновлены!',
    saveError: 'Ошибка сохранения',
    changePassword: 'Смена пароля',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердите пароль',
    currentPasswordPlaceholder: 'Введите текущий пароль',
    newPasswordPlaceholder: 'Минимум 8 символов',
    confirmPasswordPlaceholder: 'Повторите новый пароль',
    changePasswordBtn: 'Изменить пароль',
    passwordSuccess: 'Пароль успешно изменён!',
    passwordError: 'Ошибка смены пароля',
    activity: 'Активность аккаунта',
    lastLogin: 'Последний вход',
    status: 'Статус',
    statusActive: 'Активен',
    roleLabel: 'Роль',
    createdAt: 'Аккаунт создан',
    daysInSystem: 'Дней в системе',
    avgTime: 'Ср. время',
    minLength: 'Минимум 8 символов',
    passwordsNoMatch: 'Пароли не совпадают',
    nameMinLength: 'Минимум 3 символа',
    strengthWeak: 'Слабый',
    strengthFair: 'Средний',
    strengthGood: 'Хороший',
    strengthStrong: 'Надёжный'
  }
}