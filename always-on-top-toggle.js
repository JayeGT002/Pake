// Pake 注入脚本 - 窗口置顶切换按钮
// 在页面右上角添加一个浮动按钮，点击切换窗口是否置顶

(function () {
  "use strict";

  var isOnTop = false;
  var btn = null;

  function createButton() {
    if (btn) return;
    if (!document.body) return;

    btn = document.createElement("div");
    btn.id = "__pake_top_toggle__";
    btn.title = "点击切换窗口置顶 (当前: 关)";
    btn.innerHTML = "\uD83D\uDCCC"; // 📌

    // 浮动按钮样式
    btn.style.cssText =
      "position:fixed;top:12px;right:12px;z-index:2147483647;" +
      "width:38px;height:38px;line-height:38px;text-align:center;" +
      "border-radius:50%;background:rgba(0,0,0,0.55);color:#fff;" +
      "cursor:pointer;font-size:18px;user-select:none;" +
      "backdrop-filter:blur(4px);transition:background 0.25s,transform 0.15s;" +
      "box-shadow:0 2px 8px rgba(0,0,0,0.3);";

    btn.addEventListener("mouseenter", function () {
      btn.style.transform = "scale(1.12)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "scale(1)";
    });

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOnTop = !isOnTop;

      // 更新按钮外观
      if (isOnTop) {
        btn.innerHTML = "\uD83D\uDCCD"; // 📍 已置顶图标
        btn.style.background = "rgba(220,53,69,0.75)";
        btn.title = "点击取消窗口置顶 (当前: 开)";
      } else {
        btn.innerHTML = "\uD83D\uDCCC"; // 📌
        btn.style.background = "rgba(0,0,0,0.55)";
        btn.title = "点击切换窗口置顶 (当前: 关)";
      }

      // 调用 Tauri window API
      try {
        if (window.__TAURI__ && window.__TAURI__.window) {
          var w = window.__TAURI__.window.getCurrent();
          w.setAlwaysOnTop(isOnTop);
        } else if (window.__TAURI_INTERNALS__) {
          // 备选：直接调用 IPC
          window.__TAURI_INTERNALS__.invoke("plugin:window|set_always_on_top", {
            alwaysOnTop: isOnTop,
          });
        }
      } catch (err) {
        console.log("[Pake TopToggle] Tauri API error:", err.message);
      }
    });

    document.body.appendChild(btn);
  }

  // 等待 body 就绪
  if (document.body) {
    createButton();
  } else {
    document.addEventListener("DOMContentLoaded", createButton);
  }

  // SPA 页面切换时重新挂载按钮
  var observer = new MutationObserver(function () {
    if (!document.getElementById("__pake_top_toggle__") && document.body) {
      btn = null;
      createButton();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
