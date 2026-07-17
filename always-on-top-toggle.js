// Pake 注入脚本 - 窗口置顶 & 调整大小切换按钮
// 右下角两个按钮: 📌 切换置顶 | 🔒 锁定/解锁窗口大小

(function () {
  'use strict';

  var isOnTop = false;
  var isLocked = false;
  var topBtn = null;
  var lockBtn = null;

  function makeButton(id, emoji, title, bottom, right, bgColor) {
    var btn = document.createElement('div');
    btn.id = id;
    btn.title = title;
    btn.innerHTML = emoji;
    btn.style.cssText =
      'position:fixed;bottom:' + bottom + 'px;right:' + right + 'px;z-index:2147483647;' +
      'width:38px;height:38px;line-height:38px;text-align:center;' +
      'border-radius:50%;background:' + bgColor + ';color:#fff;' +
      'cursor:pointer;font-size:18px;user-select:none;' +
      'backdrop-filter:blur(4px);transition:background 0.25s,transform 0.15s;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    btn.addEventListener('mouseenter', function () { btn.style.transform = 'scale(1.12)'; });
    btn.addEventListener('mouseleave', function () { btn.style.transform = 'scale(1)'; });
    document.body.appendChild(btn);
    return btn;
  }

  function createButtons() {
    if (topBtn || lockBtn) return;
    if (!document.body) return;

    // 置顶按钮 - 右下角靠右
    topBtn = makeButton(
      '__pake_top_toggle__', '\uD83D\uDCCC', // 📌
      '点击切换窗口置顶 (当前: 关)',
      12, 12, 'rgba(0,0,0,0.55)'
    );

    // 窗口锁定按钮 - 置顶按钮左边
    lockBtn = makeButton(
      '__pake_lock_toggle__', '\uD83D\uDD13', // 🔓 默认未锁
      '点击锁定窗口大小 (当前: 可调整)',
      12, 58, 'rgba(0,0,0,0.55)'
    );

    // 置顶切换
    topBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOnTop = !isOnTop;
      if (isOnTop) {
        topBtn.innerHTML = '\uD83D\uDCCD'; // 📍
        topBtn.style.background = 'rgba(220,53,69,0.75)';
        topBtn.title = '点击取消窗口置顶 (当前: 开)';
      } else {
        topBtn.innerHTML = '\uD83D\uDCCC'; // 📌
        topBtn.style.background = 'rgba(0,0,0,0.55)';
        topBtn.title = '点击切换窗口置顶 (当前: 关)';
      }
      try {
        if (window.__TAURI_INTERNALS__) {
          window.__TAURI_INTERNALS__.invoke('plugin:window|set_always_on_top', { alwaysOnTop: isOnTop });
        }
      } catch (err) {
        console.log('[Pake] always_on_top error:', err.message);
      }
    });

    // 窗口大小锁定切换
    lockBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isLocked = !isLocked;
      if (isLocked) {
        lockBtn.innerHTML = '\uD83D\uDD12'; // 🔒 已锁
        lockBtn.style.background = 'rgba(220,53,69,0.75)';
        lockBtn.title = '点击解锁窗口大小 (当前: 已锁定)';
      } else {
        lockBtn.innerHTML = '\uD83D\uDD13'; // 🔓 未锁
        lockBtn.style.background = 'rgba(0,0,0,0.55)';
        lockBtn.title = '点击锁定窗口大小 (当前: 可调整)';
      }
      try {
        if (window.__TAURI_INTERNALS__) {
          window.__TAURI_INTERNALS__.invoke('plugin:window|set_resizable', { resizable: !isLocked });
        }
      } catch (err) {
        console.log('[Pake] set_resizable error:', err.message);
      }
    });
  }

  if (document.body) {
    createButtons();
  } else {
    document.addEventListener('DOMContentLoaded', createButtons);
  }

  var observer = new MutationObserver(function () {
    if (!document.getElementById('__pake_top_toggle__') && document.body) {
      topBtn = null;
      lockBtn = null;
      createButtons();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
