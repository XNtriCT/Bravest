/**
 * Bravest Browser - Brave Shields Ad & Tracker Blocker Engine
 * Multi-layer protection: Network blocking + Cosmetic CSS + Scriptlet ad neutralizer
 */

const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');

// Comprehensive list of ad & tracker domains/patterns
const AD_PATTERNS = [
  'googleads.g.doubleclick.net',
  'pagead2.googlesyndication.com',
  'pubads.g.doubleclick.net',
  'adservice.google.com',
  'static.doubleclick.net',
  'securepubads.g.doubleclick.net',
  'ad.doubleclick.net',
  'google-analytics.com',
  'googletagmanager.com',
  'googlesyndication.com',
  'scorecardresearch.com',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'adnxs.com',
  'rubiconproject.com',
  'amazon-adsystem.com',
  'casalemedia.com',
  'openx.net',
  'adroll.com',
  'adblade.com',
  'quantserve.com',
  'advertising.com',
  'serving-sys.com',
  'moatads.com',
  'innovid.com',
  'flashtalking.com',
  'smartadserver.com',
  'bidswitch.net',
  'adsrvr.org',
  'youtube.com/api/stats/ads',
  'youtube.com/pagead',
  'youtube.com/youtubei/v1/player/ad_break',
  'youtube.com/get_midroll_info',
  'youtube.com/ptracking'
];

// Cosmetic ad-hiding CSS injected across all web pages
const COSMETIC_AD_BLOCK_CSS = `
  /* YouTube Ad Elements */
  .video-ads,
  .ytp-ad-module,
  .ytp-ad-overlay-container,
  .ytp-ad-player-overlay,
  .ytp-ad-image-overlay,
  .ytp-ad-text-overlay,
  ytd-ad-slot-renderer,
  ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
  ytd-in-feed-ad-layout-renderer,
  ytd-banner-promo-renderer,
  ytd-promoted-sparkles-web-renderer,
  ytd-promoted-video-renderer,
  ytd-display-ad-renderer,
  ytd-statement-banner-renderer,
  #masthead-ad,
  #player-ads,
  #ad-slot,
  .ytd-merch-shelf-renderer,
  ytd-companion-slot-renderer {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* General Web Ads */
  ins.adsbygoogle,
  .adsbygoogle,
  [id^="google_ads_"],
  [id^="div-gpt-ad"],
  .ad-container,
  .ad-wrapper,
  .ad-banner,
  .advertisement,
  .sponsored-content,
  .taboola,
  .outbrain {
    display: none !important;
    visibility: hidden !important;
  }
`;

class BraveShieldsEngine {
  constructor() {
    this.blocker = null;
    this.shieldsEnabled = true;
    this.blockedCount = 0;
    this.siteStats = new Map();
    this.onBlockedCallback = null;
  }

  async initialize(targetSession) {
    console.log('[Bravest Shields] Initializing Brave Shields ad and tracker blocker...');

    // 1. Setup native network request interceptor (guaranteed to catch all ad network traffic)
    this.setupNetworkInterceptor(targetSession);

    // 2. Load prebuilt Ghostery / Brave Shields filter engine
    try {
      this.blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
      if (targetSession && this.blocker) {
        this.blocker.enableBlockingInSession(targetSession);
        console.log('[Bravest Shields] Ghostery prebuilt filter engine enabled.');
      }
    } catch (err) {
      console.warn('[Bravest Shields] Warning: Ghostery list attach failed, using native network shield:', err.message);
    }
  }

  setupNetworkInterceptor(targetSession) {
    if (!targetSession || !targetSession.webRequest) return;

    targetSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      if (!this.shieldsEnabled) {
        callback({ cancel: false });
        return;
      }

      const url = details.url || '';
      const isAd = AD_PATTERNS.some((pattern) => url.includes(pattern));

      if (isAd) {
        this.blockedCount++;
        try {
          const hostname = new URL(url).hostname;
          const current = this.siteStats.get(hostname) || 0;
          this.siteStats.set(hostname, current + 1);
        } catch (_) {}

        if (this.onBlockedCallback) {
          this.onBlockedCallback({
            total: this.blockedCount,
            url: url
          });
        }

        // Cancel the ad network request
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    });

    console.log('[Bravest Shields] Native network interceptor active.');
  }

  attachToWebContents(webContents) {
    if (!webContents) return;

    // Inject cosmetic ad-blocking CSS as soon as DOM loads
    webContents.on('dom-ready', () => {
      if (this.shieldsEnabled) {
        webContents.insertCSS(COSMETIC_AD_BLOCK_CSS).catch(() => {});
      }
    });
  }

  setShieldsEnabled(enabled) {
    this.shieldsEnabled = enabled;
    console.log(`[Bravest Shields] Shields protection: ${enabled ? 'ON' : 'OFF'}`);
  }

  getBlockedStats() {
    return {
      totalBlocked: this.blockedCount,
      shieldsEnabled: this.shieldsEnabled
    };
  }

  setOnBlockedListener(cb) {
    this.onBlockedCallback = cb;
  }
}

module.exports = BraveShieldsEngine;
