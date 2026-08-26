/**
 * Bravest Browser - YouTube Speed Turbo (3x / 4x) & Live Speed Indicator Engine
 */

(function () {
  'use strict';

  if (window.__bravest_engine_active) return;
  window.__bravest_engine_active = true;

  console.log('[Bravest] YouTube Speed & Indicator Engine Loaded');

  const SPEED_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0];
  const POPULAR_SPEEDS = [1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  let currentSpeed = parseFloat(localStorage.getItem('bravest_speed')) || 1.0;

  // ==========================================
  // 1. YouTube Ad Auto-Skipper
  // ==========================================
  function killYouTubeAds() {
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
        if (btn && typeof btn.click === 'function') btn.click();
      });
    });

    document.querySelectorAll('.ytp-ad-overlay-container, ytd-ad-slot-renderer, ytd-banner-promo-renderer, #player-ads, #masthead-ad').forEach((el) => {
      el.remove();
    });
  }

  // ==========================================
  // 2. Playback Speed Core Controller
  // ==========================================
  function applySpeed(rate, showToast = true) {
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

    updateAllIndicators(rate);

    if (showToast) {
      showBigCenterSpeedToast(rate);
    }
  }

  // ==========================================
  // 3. Prominent Big Center-Screen Speed Toast
  // ==========================================
  let toastTimer = null;
  function showBigCenterSpeedToast(rate) {
    let toast = document.getElementById('bravest-center-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bravest-center-toast';
      toast.style.cssText = `
        position: fixed;
        top: 15%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        background: rgba(12, 12, 18, 0.94);
        color: #ff5500;
        font-family: 'Segoe UI', Roboto, sans-serif;
        font-size: 32px;
        font-weight: 800;
        padding: 14px 36px;
        border-radius: 40px;
        border: 2px solid #ff5500;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 85, 0, 0.6);
        z-index: 2147483647;
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span style="font-size:36px;">🚀</span> <span>${rate.toFixed(2).replace(/\.00$/, '')}x SPEED</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, -50%) scale(1)';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -50%) scale(0.85)';
      }
    }, 1100);
  }

  // ==========================================
  // 4. Always-Visible Persistent Player HUD
  // ==========================================
  function injectPersistentPlayerPill() {
    const player = document.querySelector('#movie_player, .html5-video-player');
    if (!player) return;

    let pill = document.getElementById('bravest-persistent-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'bravest-persistent-pill';
      pill.style.cssText = `
        position: absolute;
        top: 14px;
        left: 14px;
        z-index: 999999;
        display: flex;
        align-items: center;
        background: rgba(14, 14, 22, 0.92);
        backdrop-filter: blur(10px);
        border: 1.5px solid #ff5500;
        border-radius: 20px;
        padding: 4px 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7), 0 0 10px rgba(255, 85, 0, 0.3);
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
      `;

      pill.innerHTML = `
        <span style="font-size:13px; margin-right:5px;">⚡</span>
        <span id="bravest-pill-text" style="color:#ffffff; font-weight:800; font-size:13px; font-family:'Segoe UI', sans-serif;">1.0x</span>
        <span style="color:#ff7733; font-size:10px; margin-left:6px; font-weight:600;">▼</span>
      `;

      // Quick dropdown menu on click
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSpeedDropdown(pill);
      });

      player.appendChild(pill);
    }

    // Top-Right Quick Speed Buttons
    let quickBar = document.getElementById('bravest-quick-bar');
    if (!quickBar) {
      quickBar = document.createElement('div');
      quickBar.id = 'bravest-quick-bar';
      quickBar.style.cssText = `
        position: absolute;
        top: 14px;
        right: 68px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(12, 12, 18, 0.88);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 85, 0, 0.35);
        border-radius: 8px;
        padding: 4px 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      `;

      const label = document.createElement('span');
      label.innerHTML = '⚡<b>SPEED:</b>';
      label.style.cssText = 'color:#ff6600; font-size:11px; font-family:sans-serif; margin-right:4px; user-select:none;';
      quickBar.appendChild(label);

      POPULAR_SPEEDS.forEach((spd) => {
        const btn = document.createElement('button');
        btn.className = 'bravest-speed-select-btn';
        btn.dataset.speed = spd.toString();
        btn.textContent = `${spd}x`;
        btn.style.cssText = `
          background: rgba(26, 26, 38, 0.85);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 6px;
          cursor: pointer;
          font-family: sans-serif;
          transition: all 0.15s;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          applySpeed(spd, true);
        });

        quickBar.appendChild(btn);
      });

      player.appendChild(quickBar);
    }
  }

  // Speed dropdown popup attached to the pill
  function toggleSpeedDropdown(pill) {
    let dropdown = document.getElementById('bravest-speed-dropdown');
    if (dropdown) {
      dropdown.remove();
      return;
    }

    dropdown = document.createElement('div');
    dropdown.id = 'bravest-speed-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 48px;
      left: 14px;
      z-index: 2147483647;
      background: rgba(14, 14, 22, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid #ff5500;
      border-radius: 10px;
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 85, 0, 0.4);
      width: 220px;
    `;

    SPEED_LEVELS.forEach((spd) => {
      const btn = document.createElement('button');
      btn.textContent = `${spd}x`;
      const isActive = Math.abs(spd - currentSpeed) < 0.05;
      btn.style.cssText = `
        background: ${isActive ? '#ff5500' : 'rgba(30, 30, 44, 0.9)'};
        color: ${isActive ? '#ffffff' : '#e0e0e0'};
        font-weight: ${isActive ? '800' : '600'};
        border: 1px solid ${isActive ? '#ff5500' : 'rgba(255, 255, 255, 0.1)'};
        border-radius: 6px;
        padding: 6px 0;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applySpeed(spd, true);
        dropdown.remove();
      });

      dropdown.appendChild(btn);
    });

    const player = document.querySelector('#movie_player, .html5-video-player') || document.body;
    player.appendChild(dropdown);

    const closeDropdown = (e) => {
      if (!dropdown.contains(e.target) && e.target !== pill) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => document.addEventListener('click', closeDropdown), 10);
  }

  // ==========================================
  // 5. In-Player Control Bar (Bottom Right)
  // ==========================================
  function injectBottomControlBadge() {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls) return;

    let bottomBadge = document.getElementById('bravest-bottom-speed-badge');
    if (!bottomBadge) {
      bottomBadge = document.createElement('button');
      bottomBadge.id = 'bravest-bottom-speed-badge';
      bottomBadge.className = 'ytp-button';
      bottomBadge.title = 'Bravest Speed Controller (Click to select)';
      bottomBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #ff5500;
        font-weight: 800;
        font-size: 12px;
        padding: 0 8px;
        cursor: pointer;
        user-select: none;
        vertical-align: top;
      `;

      bottomBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        const pill = document.getElementById('bravest-persistent-pill');
        if (pill) toggleSpeedDropdown(pill);
      });

      rightControls.insertBefore(bottomBadge, rightControls.firstChild);
    }
  }

  // ==========================================
  // 6. Update All UI Indicators
  // ==========================================
  function updateAllIndicators(rate) {
    const rateText = `${rate.toFixed(2).replace(/\.00$/, '')}x`;

    // 1. Update Top-Left Pill
    const pillText = document.getElementById('bravest-pill-text');
    if (pillText) {
      pillText.textContent = rateText;
    }

    // 2. Update Bottom-Right Control Badge
    const bottomBadge = document.getElementById('bravest-bottom-speed-badge');
    if (bottomBadge) {
      bottomBadge.innerHTML = `<span style="color:#ff5500; font-size:11px; margin-right:2px;">⚡</span>${rateText}`;
    }

    // 3. Update Quick Buttons
    document.querySelectorAll('.bravest-speed-select-btn').forEach((btn) => {
      const sp = parseFloat(btn.dataset.speed);
      if (Math.abs(sp - rate) < 0.05) {
        btn.style.background = '#ff5500';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#ff5500';
        btn.style.boxShadow = '0 0 8px rgba(255, 85, 0, 0.6)';
      } else {
        btn.style.background = 'rgba(26, 26, 38, 0.85)';
        btn.style.color = '#cccccc';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        btn.style.boxShadow = 'none';
      }
    });
  }

  // ==========================================
  // 7. Keyboard Hotkeys
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
  // 8. Continuous Monitor Loop
  // ==========================================
  setInterval(() => {
    killYouTubeAds();
    injectPersistentPlayerPill();
    injectBottomControlBadge();

    const video = document.querySelector('video');
    if (video && currentSpeed && Math.abs(video.playbackRate - currentSpeed) > 0.05) {
      if (!document.querySelector('.ad-showing')) {
        video.playbackRate = currentSpeed;
        video.preservesPitch = true;
      }
    }
    updateAllIndicators(video ? video.playbackRate : currentSpeed);
  }, 400);

  // Initial load
  setTimeout(() => {
    applySpeed(currentSpeed, false);
    injectPersistentPlayerPill();
    injectBottomControlBadge();
  }, 500);
})();
