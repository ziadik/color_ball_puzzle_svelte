import bridge from "@vkontakte/vk-bridge";

bridge.subscribe((e) => {
  if (e.detail.type === "VKWebAppUpdateConfig") {
    const scheme = e.detail.data.scheme;
    document.documentElement.dataset.scheme = scheme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content =
        scheme === "space_gray" || scheme === "vkcom_dark"
          ? "#19191a"
          : "#ffffff";
    }
  }
});
import { mount } from "svelte";
import App from "./App.svelte";

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
