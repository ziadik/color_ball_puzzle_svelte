import bridge from "@vkontakte/vk-bridge";

class VKBridgeService {
  constructor() {
    this.isInitialized = false;
    this.isVK = false;
    this.platform = "web";
    this.userId = null;
  }

  // Проверка, запущено ли приложение в VK
  isVKApp() {
    return this.isVK;
  }

  // Инициализация
  async init() {
    if (this.isInitialized) return;

    try {
      // Проверяем, есть ли VK Bridge
      this.isVK =
        (typeof window !== "undefined" &&
          window.location.search.includes("vk_access_token")) ||
        window.location.search.includes("vk_user_id");

      if (this.isVK) {
        // Инициализируем bridge
        bridge
          .send("VKWebAppInit", {})
          .then(() => {
            console.log("✅ VK Bridge initialized");
          })
          .catch((error) => {
            console.warn("⚠️ VK Bridge init warning:", error);
          });

        // Получаем информацию о пользователе
        try {
          const userData = await bridge.send("VKWebAppGetUserInfo", {});
          this.userId = userData.id;
          console.log("👤 User ID:", this.userId);
        } catch (error) {
          console.warn("⚠️ Could not get user info:", error);
        }

        // Получаем платформу
        try {
          const clientInfo = await bridge.send("VKWebAppGetClientInfo", {});
          this.platform = clientInfo.platform || "web";
        } catch (error) {
          console.warn("⚠️ Could not get client info:", error);
        }

        this.isInitialized = true;
      } else {
        console.log("🖥️ Running in browser (not VK)");
      }
    } catch (error) {
      console.warn("⚠️ VK Bridge initialization failed:", error);
      this.isVK = false;
    }
  }

  // Показать нативную загрузку
  showLoading() {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppShowLoading", {});
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  // Скрыть нативную загрузку
  hideLoading() {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppHideLoading", {});
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  // Показать нативный Toast
  showToast(text, type = "default") {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppShowToast", {
        text: text,
        type: type, // 'default', 'error', 'success'
      });
    } catch (error) {
      console.warn("⚠️ Could not show toast:", error);
    }
  }

  // Показать нативный alert
  showAlert(title, message) {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppShowAlert", {
        title: title,
        message: message,
      });
    } catch (error) {
      console.warn("⚠️ Could not show alert:", error);
    }
  }

  // Сохранить данные в VK Storage
  async setStorage(key, value) {
    if (!this.isVK) return;
    try {
      await bridge.send("VKWebAppStorageSet", {
        key: key,
        value: JSON.stringify(value),
      });
    } catch (error) {
      console.warn("⚠️ Could not save to storage:", error);
    }
  }

  // Получить данные из VK Storage
  async getStorage(key) {
    if (!this.isVK) return null;
    try {
      const result = await bridge.send("VKWebAppStorageGet", {
        keys: [key],
      });
      if (result && result.keys && result.keys.length > 0) {
        return JSON.parse(result.keys[0].value);
      }
      return null;
    } catch (error) {
      console.warn("⚠️ Could not get from storage:", error);
      return null;
    }
  }

  // Поделиться в VK
  share(options) {
    if (!this.isVK) {
      // Fallback для браузера
      const shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(options.link)}&title=${encodeURIComponent(options.title)}`;
      window.open(shareUrl, "_blank");
      return;
    }

    try {
      bridge.send("VKWebAppShowWallPostBox", {
        message: options.title || "",
        attachments: options.link || "",
      });
    } catch (error) {
      console.warn("⚠️ Could not share:", error);
    }
  }

  // Переход на другой VK Mini App
  openApp(appId, payload = {}) {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppOpenApp", {
        app_id: appId,
        payload: payload,
      });
    } catch (error) {
      console.warn("⚠️ Could not open app:", error);
    }
  }

  // Закрыть приложение
  closeApp() {
    if (!this.isVK) return;
    try {
      bridge.send("VKWebAppClose", {});
    } catch (error) {
      // Игнорируем
    }
  }

  // Получить параметры запуска
  getLaunchParams() {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params) {
      if (key.startsWith("vk_")) {
        result[key] = value;
      }
    }

    return result;
  }
}

// Создаем синглтон
export const vkBridge = new VKBridgeService();

// Инициализация при импорте
if (typeof window !== "undefined") {
  vkBridge.init();
}
