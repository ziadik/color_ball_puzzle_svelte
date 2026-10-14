// src/lib/i18n/ru.js

export const ru = {
  // Header
  restart: "Заново",
  settings: "Настройки",
  level: (n) => `Уровень ${n}`,

  // Меню уровней
  levels: "Уровни",
  levelCellAria: (n) => `Уровень ${n}`,
  levelCellAriaLocked: (n) => `Уровень ${n} закрыт`,

  // GameBoard / игра
  moves: (n) => `Ходов: ${n}`,
  win: "Победа!",
  winMoves: (n) => `Ходов: ${n}`,
  winNext: "Следующий уровень",
  winRestart: "Заново",
  winPlayAgain: "Играть снова",

  // Настройки
  soundEffects: "Звуки",
  vibration: "Вибрация",
  darkMode: "Тёмная тема",
  close: "Закрыть",

  // Модалка разблокировки редактора
  editorUnlockedTitle: "Редактор открыт!",
  editorUnlockedText:
    "Ты прошёл все базовые уровни. Теперь можешь создавать свои и предлагать их автору.",
  editorTry: "Попробовать",
  editorLater: "Позже",

  // Редактор
  editorTitle: "🎨 Редактор уровней",
  editorBack: "← Назад",
  editorDraw: "✏️ Рисовать",
  editorPreview: "👁️ Превью",
  editorWallsOn: "Стены: вкл",
  editorWallsOff: "Стены: выкл",
  editorSize: "Размер поля",
  editorClear: "Очистить",
  editorSubmit: "📤 Отправить автору",
  editorUndo: "Отменить (Ctrl+Z)",
  editorRedo: "Повторить (Ctrl+Shift+Z)",
  editorNew: "Новый",
  editorPrev: "Предыдущий уровень",
  editorNext: "Следующий уровень",
  editorClearConfirm: "Очистить все объекты?",
  editorFooter: (w, h, i, total) => `${w} × ${h} · Уровень ${i} из ${total}`,

  // Отправка уровня
  submitTitle: "📤 Отправить автору",
  submitName: "Название уровня",
  submitNamePlaceholder: "Мой уровень",
  submitDifficulty: "Сложность",
  submitComment: "Комментарий",
  submitCommentPlaceholder: "Например: мой первый уровень!",
  submitOptional: "(необязательно)",
  submitInfoPrefix: "Уровень будет отправлен на",
  submitInfoSuffix: "Автор проверит и опубликует его для всех игроков.",
  submitViaEmail: "📧 Открыть почту",
  submitViaService: "🌐 Отправить онлайн",
  submitCancel: "Отмена",
  submitSending: "⏳ Отправка...",
  submitSuccess: "Уровень отправлен!",
  submitSuccessText: "Автор проверит его и опубликует, если он подходит.",
  submitError: "Не удалось отправить",
  submitErrorText: "Попробуйте другой способ отправки.",
  submitBack: "Назад",
};

// Универсальный хелпер
export const t = ru;
