/**
 * Bravest Browser - Renderer UI Controller
 * Tab management, Omnibox, Shields Controller, and Webview orchestration.
 */

document.addEventListener('DOMContentLoaded', () => {
  let tabs = [];
  let activeTabId = null;
  let tabCounter = 0;

  // DOM Elements
  const tabsList = document.getElementById('tabs-list');
  const newTabBtn = document.getElementById('new-tab-btn');
  const urlInput = document.getElementById('url-input');
  const backBtn = document.getElementById('back-btn');
  const forwardBtn = document.getElementById('forward-btn');
  const reloadBtn = document.getElementById('reload-btn');
  const webviewContainer = document.getElementById('webview-container');
  const shieldsBtn = document.getElementById('shields-btn');
  const shieldsModal = document.getElementById('shields-modal');
  const shieldsToggleInput = document.getElementById('shields-toggle-input');
  const shieldsBlockedCount = document.getElementById('shields-blocked-count');
  const shieldStatAds = document.getElementById('shield-stat-ads');
  const currentSiteHost = document.getElementById('current-site-host');
  const quickYtBtn = document.getElementById('quick-yt-btn');
  const minBtn = document.getElementById('min-btn');
  const maxBtn = document.getElementById('max-btn');
  const closeBtn = document.getElementById('close-btn');
  const ytSpeedBadge = document.getElementById('yt-speed-badge');

  // Window Controls
  minBtn.addEventListener('click', () => window.bravestAPI?.minimize());
  maxBtn.addEventListener('click', () => window.bravestAPI?.maximize());
  closeBtn.addEventListener('click', () => window.bravestAPI?.close());

  /**
   * Format input into valid URL or Brave Search query
   */
  function formatSearchOrUrl(input) {
    input = input.trim();
    if (!input) return 'https://search.brave.com';

    // Check if it's already a URL
    if (/^https?:\/\//i.test(input)) {
      return input;
    }

    // Check if it looks like a domain name (e.g. youtube.com, github.com)
    if (/^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(input)) {
      return 'https://' + input;
    }

    // Default: Brave Search query
    return `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
  }

  /**
   * Create a new tab
   */
  function createTab(initialUrl = 'https://www.youtube.com') {
    tabCounter++;
    const tabId = `tab-${tabCounter}`;
    const url = formatSearchOrUrl(initialUrl);

    // Create webview element
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.src = url;
    webview.setAttribute('allowpopups', 'true');
    webview.setAttribute('webpreferences', 'contextIsolation=no');
    
    // Inject the YouTube speed engine script into the webview preload
    const preloadPath = window.location.href.includes('file://')
      ? `${window.location.origin}${window.location.pathname.replace('index.html', '../engine/youtube/webview_preload.js')}`
      : './engine/youtube/webview_preload.js';

    webviewContainer.appendChild(webview);

    const tabData = {
      id: tabId,
      title: 'New Tab',
      url: url,
      favicon: 'https://brave.com/static-assets/images/brave-logo.svg',
      webview: webview
    };

    tabs.push(tabData);

    // Create tab element in tabstrip
    const tabEl = document.createElement('div');
    tabEl.className = 'browser-tab';
    tabEl.id = `tab-el-${tabId}`;
    tabEl.innerHTML = `
      <img class="tab-favicon" src="https://brave.com/static-assets/images/brave-logo.svg" alt="icon">
      <span class="tab-title">Loading...</span>
      <button class="tab-close-btn" title="Close tab">✕</button>
    `;

    tabEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close-btn')) return;
      switchTab(tabId);
    });

    tabEl.querySelector('.tab-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tabId);
    });

    tabsList.appendChild(tabEl);

    // Webview event listeners
    webview.addEventListener('dom-ready', () => {
      // Injects the YouTube 3x/4x engine directly
      injectYouTubeSpeedEngine(webview);
    });

    webview.addEventListener('page-title-updated', (e) => {
      tabData.title = e.title;
      const titleSpan = tabEl.querySelector('.tab-title');
      if (titleSpan) titleSpan.textContent = e.title;
    });

    webview.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length > 0) {
        tabData.favicon = e.favicons[0];
        const favImg = tabEl.querySelector('.tab-favicon');
        if (favImg) favImg.src = e.favicons[0];
      }
    });

    webview.addEventListener('did-navigate', (e) => {
      tabData.url = e.url;
      if (activeTabId === tabId) {
        updateOmnibox(e.url);
      }
      injectYouTubeSpeedEngine(webview);
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
      tabData.url = e.url;
      if (activeTabId === tabId) {
        updateOmnibox(e.url);
      }
      injectYouTubeSpeedEngine(webview);
    });

    switchTab(tabId);
    return tabData;
  }

  /**
   * Inject YouTube 3x/4x script into webview
   */
  function injectYouTubeSpeedEngine(webview) {
    const currentUrl = webview.getURL() || '';
    if (currentUrl.includes('youtube.com')) {
      ytSpeedBadge.style.display = 'flex';
      // Execute the speed injection script in the webview context
      webview.executeJavaScript(`
        (function() {
          if (window.__bravest_injected) return;
          window.__bravest_injected = true;
          console.log('[Bravest] Activating YouTube 3x/4x Speed Controller');
          
          const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4];
          const QUICK_HUD_PRESETS = [1, 1.5, 2, 3, 4];
          let preferred = parseFloat(localStorage.getItem('bravest_speed')) || 1.0;

          function setRate(r) {
            r = Math.min(Math.max(r, 0.25), 4.0);
            document.querySelectorAll('video').forEach(v => {
              v.playbackRate = r;
              v.defaultPlaybackRate = r;
              v.preservesPitch = true;
            });
            localStorage.setItem('bravest_speed', r.toString());
            updateHud(r);
          }

          function updateHud(r) {
            document.querySelectorAll('.bravest-btn').forEach(btn => {
              const sp = parseFloat(btn.dataset.s);
              if (Math.abs(sp - r) < 0.05) {
                btn.style.background = '#fb542b';
                btn.style.color = '#fff';
                btn.style.fontWeight = 'bold';
              } else {
                btn.style.background = 'rgba(20,20,30,0.85)';
                btn.style.color = '#ccc';
                btn.style.fontWeight = 'normal';
              }
            });
          }

          function injectHud() {
            const player = document.querySelector('.html5-video-player');
            if (!player || document.getElementById('bravest-hud')) return;
            const hud = document.createElement('div');
            hud.id = 'bravest-hud';
            hud.style.cssText = 'position:absolute;top:12px;right:68px;z-index:9999;display:flex;gap:4px;background:rgba(15,15,22,0.85);backdrop-filter:blur(8px);padding:4px 8px;border-radius:8px;border:1px solid rgba(251,84,43,0.4);';
            hud.innerHTML = '<span style="color:#fb542b;font-size:11px;font-weight:bold;display:flex;align-items:center;padding-right:4px;">⚡Speed:</span>';
            QUICK_HUD_PRESETS.forEach(s => {
              const b = document.createElement('button');
              b.className = 'bravest-btn';
              b.dataset.s = s;
              b.textContent = s + 'x';
              b.style.cssText = 'background:rgba(20,20,30,0.85);color:#ccc;border:none;border-radius:4px;padding:3px 6px;font-size:11px;cursor:pointer;';
              b.onclick = (e) => { e.stopPropagation(); e.preventDefault(); setRate(s); };
              hud.appendChild(b);
            });
            player.appendChild(hud);
            const v = player.querySelector('video');
            if (v) updateHud(v.playbackRate);
          }

          window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            const v = document.querySelector('video');
            if (!v) return;
            if (e.shiftKey && (e.key === '>' || e.key === '.')) {
              e.stopImmediatePropagation(); e.preventDefault();
              let cur = Math.round(v.playbackRate * 100) / 100;
              let next = 4.0;
              for (let s of SPEED_PRESETS) { if (s > cur + 0.05) { next = s; break; } }
              setRate(next);
            } else if (e.shiftKey && (e.key === '<' || e.key === ',')) {
              e.stopImmediatePropagation(); e.preventDefault();
              let cur = Math.round(v.playbackRate * 100) / 100;
              let prev = 0.25;
              for (let i = SPEED_PRESETS.length - 1; i >= 0; i--) {
                if (SPEED_PRESETS[i] < cur - 0.05) { prev = SPEED_PRESETS[i]; break; }
              }
              setRate(prev);
            }
          }, true);

          setInterval(injectHud, 1200);
          setInterval(() => {
            const v = document.querySelector('video');
            if (v && preferred && v.playbackRate !== preferred) {
              v.playbackRate = preferred;
              v.preservesPitch = true;
            }
          }, 1500);
        })();
      `).catch(() => {});
    } else {
      ytSpeedBadge.style.display = 'none';
    }
  }

  /**
   * Switch active tab
   */
  function switchTab(tabId) {
    activeTabId = tabId;
    tabs.forEach((tab) => {
      const tabEl = document.getElementById(`tab-el-${tab.id}`);
      if (tab.id === tabId) {
        tab.webview.classList.add('active');
        if (tabEl) tabEl.classList.add('active');
        updateOmnibox(tab.webview.getURL() || tab.url);
      } else {
        tab.webview.classList.remove('active');
        if (tabEl) tabEl.classList.remove('active');
      }
    });
  }

  /**
   * Close a tab
   */
  function closeTab(tabId) {
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    const tab = tabs[index];
    if (tab.webview && tab.webview.parentNode) {
      tab.webview.parentNode.removeChild(tab.webview);
    }
    const tabEl = document.getElementById(`tab-el-${tabId}`);
    if (tabEl && tabEl.parentNode) {
      tabEl.parentNode.removeChild(tabEl);
    }

    tabs.splice(index, 1);

    if (tabs.length === 0) {
      createTab('https://search.brave.com');
    } else if (activeTabId === tabId) {
      const newActive = tabs[Math.max(0, index - 1)];
      switchTab(newActive.id);
    }
  }

  /**
   * Update Omnibox URL display
   */
  function updateOmnibox(url) {
    urlInput.value = url;
    try {
      const host = new URL(url).hostname;
      currentSiteHost.textContent = host || 'Protected';
    } catch (_) {
      currentSiteHost.textContent = 'Protected';
    }

    if (url.includes('youtube.com')) {
      ytSpeedBadge.style.display = 'flex';
    } else {
      ytSpeedBadge.style.display = 'none';
    }
  }

  /**
   * Navigation actions
   */
  function getActiveWebview() {
    const active = tabs.find((t) => t.id === activeTabId);
    return active ? active.webview : null;
  }

  backBtn.addEventListener('click', () => {
    const wv = getActiveWebview();
    if (wv && wv.canGoBack()) wv.goBack();
  });

  forwardBtn.addEventListener('click', () => {
    const wv = getActiveWebview();
    if (wv && wv.canGoForward()) wv.goForward();
  });

  reloadBtn.addEventListener('click', () => {
    const wv = getActiveWebview();
    if (wv) wv.reload();
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const targetUrl = formatSearchOrUrl(urlInput.value);
      const wv = getActiveWebview();
      if (wv) {
        wv.loadURL(targetUrl);
      }
    }
  });

  newTabBtn.addEventListener('click', () => {
    createTab('https://www.youtube.com');
  });

  quickYtBtn.addEventListener('click', () => {
    createTab('https://www.youtube.com');
  });

  // Bookmarks clicks
  document.querySelectorAll('.bookmark-item').forEach((bm) => {
    bm.addEventListener('click', () => {
      const url = bm.dataset.url;
      const wv = getActiveWebview();
      if (wv) {
        wv.loadURL(url);
      } else {
        createTab(url);
      }
    });
  });

  // Shields UI interactions
  shieldsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shieldsModal.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!shieldsModal.contains(e.target) && e.target !== shieldsBtn) {
      shieldsModal.classList.add('hidden');
    }
  });

  shieldsToggleInput.addEventListener('change', () => {
    const enabled = shieldsToggleInput.checked;
    window.bravestAPI?.toggleShields(enabled);
  });

  // Shields live stats updates from main process
  if (window.bravestAPI?.onShieldsUpdate) {
    window.bravestAPI.onShieldsUpdate((data) => {
      shieldsBlockedCount.textContent = data.total || 0;
      shieldStatAds.textContent = data.total || 0;
    });
  }

  // Keyboard Shortcuts: Ctrl+T, Ctrl+W, Ctrl+L
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      createTab('https://www.youtube.com');
    } else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      urlInput.select();
    }
  });

  // Initial tab on startup: YouTube with 3x/4x speed support
  createTab('https://www.youtube.com');
});
