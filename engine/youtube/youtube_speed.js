/**
 * Bravest Browser - YouTube 3x & 4x Playback Speed Engine
 * Seamlessly integrates 3x and 4x speed multipliers into YouTube's native UI,
 * keyboard controls, and HTML5 video pipeline with pitch preservation.
 */

(function () {
  'use strict';

  if (window.__bravest_yt_speed_initialized) return;
  window.__bravest_yt_speed_initialized = true;

  const STORAGE_KEY = 'bravest_preferred_speed';
  let preferredSpeed = parseFloat(localStorage.getItem(STORAGE_KEY)) || 1.0;

  console.log('[Bravest] YouTube 3x/4x Speed Engine loaded. Preferred speed:', preferredSpeed);

  // Speed options including extended 3x and 4x
  const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4];
  const QUICK_HUD_PRESETS = [1, 1.5, 2, 3, 4];

  /**
   * Set playback rate with pitch preservation on all active videos
   */
  function setVideoSpeed(rate, updateStorage = true) {
    rate = Math.min(Math.max(rate, 0.25), 4.0);
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.playbackRate = rate;
      video.defaultPlaybackRate = rate;
      // Ensure audio pitch correction is preserved
      if ('preservesPitch' in video) video.preservesPitch = true;
      if ('mozPreservesPitch' in video) video.mozPreservesPitch = true;
      if ('webkitPreservesPitch' in video) video.webkitPreservesPitch = true;
    });

    if (updateStorage) {
      preferredSpeed = rate;
      localStorage.setItem(STORAGE_KEY, rate.toString());
    }

    updateHudIndicator(rate);
    showSpeedToast(`${rate}x`);
  }

  /**
   * Temporary on-screen speed toast notification
   */
  let toastTimeout = null;
  function showSpeedToast(text) {
    let toast = document.getElementById('bravest-speed-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bravest-speed-toast';
      toast.style.cssText = `
        position: absolute;
        top: 12%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 15, 25, 0.88);
        color: #ff5500;
        font-family: 'Segoe UI', Roboto, sans-serif;
        font-size: 24px;
        font-weight: 700;
        padding: 8px 24px;
        border-radius: 20px;
        border: 1px solid rgba(255, 85, 0, 0.4);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 85, 0, 0.3);
        z-index: 999999;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        opacity: 0;
      `;
      const player = document.querySelector('.html5-video-player') || document.body;
      player.appendChild(toast);
    }

    toast.textContent = `🚀 ${text}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) scale(1)';

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) scale(0.9)';
      }
    }, 900);
  }

  /**
   * Update the on-player HUD controller buttons
   */
  function updateHudIndicator(currentRate) {
    const hud = document.getElementById('bravest-player-speed-hud');
    if (!hud) return;

    const buttons = hud.querySelectorAll('.bravest-speed-btn');
    buttons.forEach((btn) => {
      const speed = parseFloat(btn.dataset.speed);
      if (Math.abs(speed - currentRate) < 0.01) {
        btn.classList.add('active');
        btn.style.background = '#ff5500';
        btn.style.color = '#ffffff';
        btn.style.fontWeight = 'bold';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(20, 20, 30, 0.75)';
        btn.style.color = '#e0e0e0';
        btn.style.fontWeight = 'normal';
      }
    });
  }

  /**
   * Create and attach the sleek on-player quick speed controller HUD
   */
  function injectPlayerHud() {
    const player = document.querySelector('.html5-video-player');
    if (!player || document.getElementById('bravest-player-speed-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'bravest-player-speed-hud';
    hud.style.cssText = `
      position: absolute;
      top: 14px;
      right: 64px;
      display: flex;
      gap: 4px;
      z-index: 9999;
      background: rgba(10, 10, 15, 0.75);
      backdrop-filter: blur(8px);
      padding: 4px 6px;
      border-radius: 8px;
      border: 1px solid rgba(255, 85, 0, 0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      transition: opacity 0.2s ease;
      opacity: 0.85;
    `;

    hud.addEventListener('mouseenter', () => { hud.style.opacity = '1'; });
    hud.addEventListener('mouseleave', () => { hud.style.opacity = '0.85'; });

    // Speed badge label
    const label = document.createElement('span');
    label.textContent = '⚡ Speed:';
    label.style.cssText = `
      color: #ff7733;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      padding-right: 4px;
      user-select: none;
      font-family: Roboto, Arial, sans-serif;
    `;
    hud.appendChild(label);

    QUICK_HUD_PRESETS.forEach((speed) => {
      const btn = document.createElement('button');
      btn.className = 'bravest-speed-btn';
      btn.dataset.speed = speed.toString();
      btn.textContent = `${speed}x`;
      btn.style.cssText = `
        background: rgba(20, 20, 30, 0.75);
        color: #e0e0e0;
        border: none;
        border-radius: 4px;
        font-size: 11px;
        padding: 3px 7px;
        cursor: pointer;
        font-family: Roboto, Arial, sans-serif;
        transition: all 0.15s ease;
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        setVideoSpeed(speed);
      });

      btn.addEventListener('mouseenter', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = 'rgba(255, 85, 0, 0.4)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = 'rgba(20, 20, 30, 0.75)';
        }
      });

      hud.appendChild(btn);
    });

    player.appendChild(hud);
    const video = player.querySelector('video');
    if (video) updateHudIndicator(video.playbackRate || preferredSpeed);
  }

  /**
   * Intercept and inject 3x and 4x into YouTube's native player gear popup settings menu
   */
  function patchYouTubeSettingsMenu() {
    const observer = new MutationObserver(() => {
      const menuPanels = document.querySelectorAll('.ytp-panel-menu');
      menuPanels.forEach((panel) => {
        // Check if this is the playback speed submenu
        const items = panel.querySelectorAll('.ytp-menuitem');
        if (items.length === 0) return;

        let hasSpeedItems = false;
        let hasCustomOrNormal = false;
        items.forEach((item) => {
          const text = item.textContent.trim();
          if (text === 'Normal' || text === '1.5' || text === '2' || text.includes('0.25')) {
            hasSpeedItems = true;
          }
          if (text === 'Normal' || text.includes('1')) {
            hasCustomOrNormal = true;
          }
        });

        if (hasSpeedItems && !panel.dataset.bravestExtended) {
          panel.dataset.bravestExtended = 'true';

          // Add 3x and 4x menu items if not already present
          const existingSpeeds = Array.from(items).map((i) => i.textContent.trim());

          [3, 4].forEach((speed) => {
            const speedStr = speed.toString();
            if (!existingSpeeds.includes(speedStr) && !existingSpeeds.includes(`${speedStr}x`)) {
              const lastItem = items[items.length - 1];
              const newItem = lastItem.cloneNode(true);

              const labelEl = newItem.querySelector('.ytp-menuitem-label');
              const contentEl = newItem.querySelector('.ytp-menuitem-content');

              if (labelEl) labelEl.textContent = `${speedStr} (Bravest)`;
              if (contentEl) contentEl.textContent = '';

              newItem.setAttribute('aria-checked', 'false');

              newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                setVideoSpeed(speed);

                // Update aria-checked across items
                panel.querySelectorAll('.ytp-menuitem').forEach((it) => {
                  it.setAttribute('aria-checked', 'false');
                });
                newItem.setAttribute('aria-checked', 'true');

                // Close settings popup
                const settingsBtn = document.querySelector('.ytp-settings-button');
                if (settingsBtn) settingsBtn.click();
              });

              panel.appendChild(newItem);
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Keyboard shortcuts: enhance Shift + > and Shift + < to scale all the way up to 4x
   */
  function setupKeyboardShortcuts() {
    window.addEventListener(
      'keydown',
      (e) => {
        // Only if not in an input/textarea/contenteditable
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

        const video = document.querySelector('video');
        if (!video) return;

        // Shift + > (speed up)
        if (e.shiftKey && (e.key === '>' || e.key === '.')) {
          e.stopImmediatePropagation();
          e.preventDefault();
          const current = Math.round(video.playbackRate * 100) / 100;
          let next = 4.0;
          for (let i = 0; i < SPEED_PRESETS.length; i++) {
            if (SPEED_PRESETS[i] > current + 0.05) {
              next = SPEED_PRESETS[i];
              break;
            }
          }
          setVideoSpeed(next);
        }

        // Shift + < (speed down)
        if (e.shiftKey && (e.key === '<' || e.key === ',')) {
          e.stopImmediatePropagation();
          e.preventDefault();
          const current = Math.round(video.playbackRate * 100) / 100;
          let prev = 0.25;
          for (let i = SPEED_PRESETS.length - 1; i >= 0; i--) {
            if (SPEED_PRESETS[i] < current - 0.05) {
              prev = SPEED_PRESETS[i];
              break;
            }
          }
          setVideoSpeed(prev);
        }
      },
      true // Capture phase to preempt YouTube default 2x ceiling
    );
  }

  /**
   * Monitor video element initialization & maintain speed across videos
   */
  function monitorVideos() {
    const applyToNewVideos = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        if (!video.dataset.bravestTracked) {
          video.dataset.bravestTracked = 'true';

          // Apply preferred speed
          if (preferredSpeed && preferredSpeed !== 1.0) {
            video.playbackRate = preferredSpeed;
          }

          video.addEventListener('play', () => {
            if (preferredSpeed && video.playbackRate !== preferredSpeed) {
              video.playbackRate = preferredSpeed;
            }
            if ('preservesPitch' in video) video.preservesPitch = true;
          });

          video.addEventListener('ratechange', () => {
            updateHudIndicator(video.playbackRate);
          });
        }
      });
      injectPlayerHud();
    };

    // Observer for DOM updates
    const domObserver = new MutationObserver(applyToNewVideos);
    domObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // YouTube SPA navigation events
    window.addEventListener('yt-navigate-finish', () => {
      setTimeout(applyToNewVideos, 400);
      setTimeout(applyToNewVideos, 1200);
    });

    applyToNewVideos();
  }

  // Initialize all subsystems
  setupKeyboardShortcuts();
  patchYouTubeSettingsMenu();
  monitorVideos();

  // Retry HUD injection periodically to handle YouTube's lazy player loading
  setInterval(injectPlayerHud, 1500);
})();
