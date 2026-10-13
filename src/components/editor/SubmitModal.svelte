<!-- src/components/editor/SubmitModal.svelte -->
<script>
  import { vkBridge } from '../../lib/services/vkBridge.js';

  let {
    isOpen = false,
    level = null,
    isDark = false,
    isMobile = false,
    onClose,
  } = $props();

  // ⚠️ ЗАМЕНИТЕ НА ВАШ EMAIL
  const AUTHOR_EMAIL = 'zyadik@mail.ru';
  const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/zyadik@mail.ru';

  let title = $state('');
  let difficulty = $state(3);
  let comment = $state('');
  let isSending = $state(false);
  let sendStatus = $state(null);

  function generateEmailBody() {
    const userInfo = vkBridge.isVKApp()
      ? `VK ID: ${vkBridge.userId}`
      : 'Веб-браузер';

    return `Новый уровень для игры!

=== ИНФОРМАЦИЯ ===
Автор: ${userInfo}
Название: ${title || 'Без названия'}
Сложность: ${'⭐'.repeat(difficulty)}
Комментарий: ${comment || '—'}
Дата: ${new Date().toLocaleString('ru-RU')}

=== JSON УРОВНЯ ===
${JSON.stringify(level, null, 2)}

=== КОНЕЦ ===`;
  }

  function sendViaEmail() {
    const subject = `🎮 Новый уровень: ${title || 'Без названия'}`;
    const body = generateEmailBody();
    const mailtoUrl = `mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    sendStatus = 'success';
  }

  async function sendViaService() {
    isSending = true;
    sendStatus = null;

    try {
      const payload = {
        _subject: `🎮 Новый уровень: ${title || 'Без названия'}`,
        _template: 'table',
        _captcha: 'false',
        author: vkBridge.isVKApp() ? `VK #${vkBridge.userId}` : 'Web',
        title: title || 'Без названия',
        difficulty: '⭐'.repeat(difficulty),
        comment: comment || '—',
        date: new Date().toLocaleString('ru-RU'),
        level_json: JSON.stringify(level, null, 2),
      };

      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      sendStatus = response.ok ? 'success' : 'error';
    } catch (e) {
      console.error('Submit error:', e);
      sendStatus = 'error';
    } finally {
      isSending = false;
    }
  }

  function close() {
    if (sendStatus === 'success') {
      title = '';
      difficulty = 3;
      comment = '';
      sendStatus = null;
    }
    onClose?.();
  }
</script>

{#if isOpen}
  <div class="overlay" class:dark={isDark} on:click={(e) => e.target === e.currentTarget && close()}>
    <div class="modal" class:dark={isDark} class:mobile={isMobile}>
      
      {#if sendStatus === 'success'}
        <div class="status-view">
          <div class="status-icon">✅</div>
          <h2>Уровень отправлен!</h2>
          <p>Автор проверит его и опубликует, если он подходит.</p>
          <button class="btn primary" on:click={close}>Закрыть</button>
        </div>
      {:else if sendStatus === 'error'}
        <div class="status-view">
          <div class="status-icon">❌</div>
          <h2>Не удалось отправить</h2>
          <p>Попробуйте другой способ отправки.</p>
          <button class="btn secondary" on:click={() => sendStatus = null}>Назад</button>
        </div>
      {:else}
        <h2>📤 Отправить автору</h2>

        <div class="form-group">
          <label>Название уровня</label>
          <input 
            type="text" 
            bind:value={title}
            placeholder="Мой уровень"
            maxlength="40"
          />
        </div>

        <div class="form-group">
          <label>Сложность</label>
          <div class="difficulty">
            {#each [1, 2, 3, 4, 5] as lvl}
              <button 
                class="star" 
                class:active={lvl <= difficulty}
                on:click={() => difficulty = lvl}
              >⭐</button>
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label>Комментарий <span class="optional">(необязательно)</span></label>
          <textarea 
            bind:value={comment}
            placeholder="Например: мой первый уровень!"
            maxlength="200"
            rows="3"
          ></textarea>
        </div>

        <div class="info-box">
          <p class="info-text">
            Уровень будет отправлен на <strong>{AUTHOR_EMAIL}</strong>.<br>
            Автор проверит и опубликует его для всех игроков.
          </p>
        </div>

        <div class="buttons">
          <button class="btn primary" on:click={sendViaEmail} disabled={isSending}>
            📧 Открыть почту
          </button>
          <button class="btn secondary" on:click={sendViaService} disabled={isSending}>
            {isSending ? '⏳ Отправка...' : '🌐 Отправить онлайн'}
          </button>
          <button class="btn cancel" on:click={close}>Отмена</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  .modal.dark {
    background: #2d234b;
    color: #d9c8fb;
  }

  .modal.mobile {
    padding: 20px 16px;
    border-radius: 16px;
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #50427d;
    margin: 0 0 20px;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #50427d;
    margin-bottom: 6px;
  }

  .modal.dark .form-group label {
    color: #d9c8fb;
  }

  .optional {
    font-weight: 400;
    opacity: 0.6;
    font-size: 11px;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid rgba(80, 66, 125, 0.15);
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    color: #50427d;
    background: #f8f4ff;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .modal.dark input[type="text"],
  .modal.dark textarea {
    background: #363344;
    color: #d9c8fb;
    border-color: rgba(217, 200, 251, 0.15);
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #722FC0;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  .difficulty {
    display: flex;
    gap: 4px;
  }

  .star {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    opacity: 0.3;
    transition: opacity 0.15s, transform 0.15s;
  }

  .star.active {
    opacity: 1;
    transform: scale(1.1);
  }

  .star:hover {
    transform: scale(1.2);
  }

  .info-box {
    background: rgba(114, 47, 192, 0.06);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .modal.dark .info-box {
    background: rgba(217, 200, 251, 0.06);
  }

  .info-text {
    font-size: 12px;
    color: #50427d;
    margin: 0;
    line-height: 1.5;
  }

  .modal.dark .info-text {
    color: #d9c8fb;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn.primary {
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
    color: #ffffff;
  }

  .btn.secondary {
    background: rgba(80, 66, 125, 0.08);
    color: #50427d;
  }

  .modal.dark .btn.secondary {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .btn.cancel {
    background: transparent;
    color: #50427d;
    opacity: 0.6;
  }

  .modal.dark .btn.cancel {
    color: #d9c8fb;
  }

  .status-view {
    text-align: center;
    padding: 20px 0;
  }

  .status-icon {
    font-size: 56px;
    margin-bottom: 12px;
  }

  .status-view p {
    font-size: 14px;
    color: #50427d;
    opacity: 0.8;
    margin: 8px 0 20px;
  }

  .modal.dark .status-view p {
    color: #d9c8fb;
  }
</style>