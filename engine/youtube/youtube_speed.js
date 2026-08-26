/**
 * Bravest Browser - YouTube Speed Turbo (3x / 4x) & Ad Skipper Engine
 */

(function () {
  'use strict';

  if (window.__bravest_engine_active) return;
  window.__bravest_engine_active = true;

  console.log('[Bravest] YouTube 3x/4x & Anti-Ad Engine Active');

  const SPEED_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0];
  const HUD_SPEEDS = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  let currentSpeed = parseFloat(localStorage.getItem('bravest_speed')) || 1.0;

  // ==========================================
  // 1. YouTube Ad Auto-Skipper & Neutralizer
  // ==========================================
  function killYouTubeAds() {
    // 1. Fast forward through any active ad video
    const adShowing = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay');
    const videos = document.querySelectorAll('video');

    if (adShowing) {
      videos.forEach((v) => {
        if (!isNaN(v.duration) && v.duration > 0) {
          v.currentTime = v.duration + 1;
        }
        v.playbackRate = 16.0;
        v.muted = true;
      });
    }

    // 2. Click all skip ad buttons automatically
    const skipSelectors = [
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button-text',
      '.videoAdUiSkipButton',
      'button[id^="skip-button"]'
    ];

    skipSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((btn) => {
        if (btn && typeof btn.click === 'function') {
          btn.click();
        }
      });
    });

    // 3. Remove popup ad overlays and sponsor banners
    const adElements = document.querySelectorAll(
      '.ytp-ad-overlay-container, ytd-ad-slot-renderer, ytd-banner-promo-renderer, #player-ads, #masthead-ad'
    );
    adElements.forEach((el) => {
      el.remove();
    });
  }

  // ==========================================
  // 2. Playback Speed Core Controller
  // ==========================================
  function applySpeed(rate, showNotification = true) {
    rate = Math.round(Math.min(Math.max(rate, 0.25), 4.0) * 100) / 100;
    currentSpeed = rate;
    localStorage.setItem('bravest_speed', rate.toString());

    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.playbackRate = rate;
      video.defaultPlaybackRate = rate;
      if ('preservesPitch' in video) video.preservesPitch = true;
      if ('webkitPreservesPitch' in video) video.webkitPreservesPitch = true;
    });

    updateHudButtons(rate);
    if (showNotification) {
      renderSpeedToast(`${rate}x SPEED`);
    }
  }

  // ==========================================
  // 3. On-Screen Speed Notification Toast
  // ==========================================
  let toastTimer = null;
  function renderSpeedToast(text) {
    let toast = document.getElementById('bravest-speed-banner');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bravest-speed-banner';
      toast.style.cssText = `
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(18, 18, 26, 0.95);
        color: #ff5500;
        font-family: 'Segoe UI', Roboto, sans-serif;
        font-size: 26px;
        font-weight: 800;
        padding: 10px 28px;
        border-radius: 30px;
        border: 2px solid #ff5500;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 85, 0, 0.5);
        z-index: 99999999;
        pointer-events: none;
        transition: all 0.2s ease;
        opacity: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>🚀</span> <span>${text}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) scale(1)';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) scale(0.9)';
      }
    }, 1000);
  }

  // ==========================================
  // 4. Floating On-Player HUD Buttons
  // ==========================================
  function injectPlayerHud() {
    const player = document.querySelector('#movie_player, .html5-video-player, video');
    if (!player) return;

    const parent = document.querySelector('#movie_player') || document.querySelector('.html5-video-player') || document.body;
    let hud = document.getElementById('bravest-speed-hud');

    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'bravest-speed-hud';
      hud.style.cssText = `
        position: absolute;
        top: 14px;
        right: 70px;
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 999999;
        background: rgba(14, 14, 20, 0.88);
        backdrop-filter: blur(10px);
        padding: 4px 8px;
        border-radius: 8px;
        border: 1px solid rgba(255, 85, 0, 0.4);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        user-select: none;
      `;

      const title = document.createElement('span');
      title.innerHTML = '⚡<b>SPEED:</b>';
      title.style.cssText = 'color:#ff6600;font-size:11px;padding-right:4px;font-family:sans-serif;letter-spacing:0.5px;';
      hud.appendChild(title);

      HUD_SPEEDS.forEach((speed) => {
        const btn = document.createElement('button');
        btn.className = 'bravest-hud-btn';
        btn.dataset.speed = speed.toString();
        btn.textContent = `${speed}x`;
        btn.style.cssText = `
          background: rgba(30, 30, 42, 0.85);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 7px;
          cursor: pointer;
          font-family: sans-serif;
          transition: all 0.15s ease;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          applySpeed(speed, true);
        });

        hud.appendChild(btn);
      });

      parent.appendChild(hud);
    }

    updateHudButtons(currentSpeed);
  }

  function updateHudButtons(speed) {
    document.querySelectorAll('.bravest-hud-btn').forEach((btn) => {
      const btnSpeed = parseFloat(btn.dataset.speed);
      if (Math.abs(btnSpeed - speed) < 0.05) {
        btn.style.background = '#ff5500';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#ff5500';
        btn.style.boxShadow = '0 0 8px rgba(255, 85, 0, 0.6)';
      } else {
        btn.style.background = 'rgba(30, 30, 42, 0.85)';
        btn.style.color = '#cccccc';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        btn.style.boxShadow = 'none';
      }
    });
  }

  // ==========================================
  // 5. YouTube Native Settings Menu Extension
  // ==========================================
  function patchSettingsMenu() {
    const panels = document.querySelectorAll('.ytp-panel-menu');
    panels.forEach((panel) => {
      const items = panel.querySelectorAll('.ytp-menuitem');
      if (items.length === 0) return;

      const isSpeedMenu = Array.from(items).some((i) => {
        const txt = i.textContent.trim();
        return txt === 'Normal' || txt === '1.5' || txt === '2';
      });

      if (isSpeedMenu && !panel.dataset.bravestExtended) {
        panel.dataset.bravestExtended = 'true';

        [2.5, 3.0, 3.5, 4.0].forEach((spd) => {
          const item = document.createElement('div');
          item.className = 'ytp-menuitem';
          item.setAttribute('role', 'menuitemradio');
          item.setAttribute('tabindex', '0');
          item.innerHTML = `
            <div class="ytp-menuitem-icon"></div>
            <div class="ytp-menuitem-label">${spd} (Bravest Turbo)</div>
            <div class="ytp-menuitem-content"></div>
          `;

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            applySpeed(spd, true);
            const settingsBtn = document.querySelector('.ytp-settings-button');
            if (settingsBtn) settingsBtn.click();
          });

          panel.appendChild(item);
        });
      }
    });
  }

  // ==========================================
  // 6. Keyboard Hotkeys
  // ==========================================
  window.addEventListener(
    'keydown',
    (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;

      const video = document.querySelector('video');
      if (!video) return;

      // Shift + > or ] key (Speed up)
      if ((e.shiftKey && (e.key === '>' || e.key === '.')) || e.key === ']') {
        e.stopImmediatePropagation();
        e.preventDefault();
        const cur = Math.round(video.playbackRate * 100) / 100;
        let next = 4.0;
        for (let i = 0; i < SPEED_LEVELS.length; i++) {
          if (SPEED_LEVELS[i] > cur + 0.05) {
            next = SPEED_LEVELS[i];
            break;
          }
        }
        applySpeed(next, true);
      }

      // Shift + < or [ key (Speed down)
      if ((e.shiftKey && (e.key === '<' || e.key === ',')) || e.key === '[') {
        e.stopImmediatePropagation();
        e.preventDefault();
        const cur = Math.round(video.playbackRate * 100) / 100;
        let prev = 0.25;
        for (let i = SPEED_LEVELS.length - 1; i >= 0; i--) {
          if (SPEED_LEVELS[i] < cur - 0.05) {
            prev = SPEED_LEVELS[i];
            break;
          }
        }
        applySpeed(prev, true);
      }
    },
    true
  );

  // ==========================================
  // 7. Enforcer Loop
  // ==========================================
  setInterval(() => {
    killYouTubeAds();
    injectPlayerHud();
    patchSettingsMenu();

    // Maintain preferred speed on active video
    const video = document.querySelector('video');
    if (video && currentSpeed && Math.abs(video.playbackRate - currentSpeed) > 0.05) {
      if (!document.querySelector('.ad-showing')) {
        video.playbackRate = currentSpeed;
        video.preservesPitch = true;
      }
    }
  }, 400);

  // Initial load
  setTimeout(() => {
    applySpeed(currentSpeed, false);
    injectPlayerHud();
  }, 600);
})();
