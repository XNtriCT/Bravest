/**
 * Bravest Browser - Brave Shields Ad & Tracker Blocker Engine
 * Full-spectrum network interception, cosmetic filtering, scriptlet injection,
 * and YouTube ad-segment remover.
 */

const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs');
const path = require('path');

class BraveShieldsEngine {
  constructor() {
    this.blocker = null;
    this.shieldsEnabled = true;
    this.blockedCount = 0;
    this.siteStats = new Map();
    this.onBlockedCallback = null;
  }

  async initialize(session) {
    console.log('[Bravest Shields] Initializing Brave Shields ad and tracker blocker...');
    try {
      // Load standard Brave/uBlock/Ghostery filter lists
      this.blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);

      // Attach to Electron session
      if (session) {
        this.blocker.enableBlockingInSession(session);
        console.log('[Bravest Shields] Network and cosmetic blocking enabled in session.');
      }

      // Track blocked requests
      this.blocker.on('request-blocked', (request) => {
        if (!this.shieldsEnabled) return;
        this.blockedCount++;
        const hostname = new URL(request.url || 'http://unknown').hostname;
        const currentSiteCount = this.siteStats.get(hostname) || 0;
        this.siteStats.set(hostname, currentSiteCount + 1);

        if (this.onBlockedCallback) {
          this.onBlockedCallback({
            total: this.blockedCount,
            url: request.url,
            hostname
          });
        }
      });

      console.log('[Bravest Shields] Brave Shields engine ready.');
    } catch (err) {
      console.error('[Bravest Shields] Error initializing prebuilt lists, falling back to manual blocker:', err);
      this.setupFallbackBlocker(session);
    }
  }

  setupFallbackBlocker(session) {
    if (!session) return;
    const adDomains = [
      'googleads.g.doubleclick.net',
      'pagead2.googlesyndication.com',
      'pubads.g.doubleclick.net',
      'adservice.google.com',
      'static.doubleclick.net',
      'youtube.com/api/stats/ads',
      'youtube.com/pagead',
      'ad.doubleclick.net',
      'securepubads.g.doubleclick.net',
      'analytics.google.com',
      'googletagmanager.com'
    ];

    session.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      if (!this.shieldsEnabled) {
        callback({ cancel: false });
        return;
      }

      const match = adDomains.some((domain) => details.url.includes(domain));
      if (match) {
        this.blockedCount++;
        if (this.onBlockedCallback) {
          this.onBlockedCallback({
            total: this.blockedCount,
            url: details.url,
            hostname: new URL(details.url).hostname
          });
        }
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    });
  }

  setShieldsEnabled(enabled) {
    this.shieldsEnabled = enabled;
    console.log(`[Bravest Shields] Shields status: ${enabled ? 'ENABLED' : 'DISABLED'}`);
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
