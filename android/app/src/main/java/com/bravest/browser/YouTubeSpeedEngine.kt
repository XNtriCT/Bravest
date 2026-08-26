package com.bravest.browser

import android.webkit.WebView

object YouTubeSpeedEngine {

    val SPEED_INJECTION_JS = """
        (function() {
            if (window.__bravest_mobile_active) return;
            window.__bravest_mobile_active = true;

            console.log('[Bravest Android] YouTube 3x/4x & Background Playback Engine Loaded');

            const SPEED_OPTIONS = [0.5, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0];
            let preferredSpeed = parseFloat(localStorage.getItem('bravest_speed')) || 1.0;

            // 1. Background Playback Override (Brave feature)
            Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
            Object.defineProperty(document, 'hidden', { value: false, writable: false });
            document.addEventListener('visibilitychange', function(e) { e.stopImmediatePropagation(); }, true);

            // 2. Set Video Speed Function
            window.bravestSetSpeed = function(rate) {
                rate = Math.min(Math.max(rate, 0.25), 4.0);
                preferredSpeed = rate;
                localStorage.setItem('bravest_speed', rate.toString());

                document.querySelectorAll('video').forEach(function(v) {
                    v.playbackRate = rate;
                    v.defaultPlaybackRate = rate;
                    if ('preservesPitch' in v) v.preservesPitch = true;
                });

                var pill = document.getElementById('bravest-mobile-pill-text');
                if (pill) pill.textContent = rate + 'x';
            };

            // 3. Inject Floating Speed Controller for Mobile YouTube
            function injectMobileHud() {
                if (document.getElementById('bravest-mobile-speed-hud')) return;

                var hud = document.createElement('div');
                hud.id = 'bravest-mobile-speed-hud';
                hud.style.cssText = 'position:fixed;bottom:70px;right:14px;z-index:999999;background:rgba(15,15,24,0.92);backdrop-filter:blur(8px);border:1.5px solid #ff5500;border-radius:24px;padding:6px 14px;display:flex;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,0.8),0 0 12px rgba(255,85,0,0.4);user-select:none;cursor:pointer;';
                hud.innerHTML = '<span style="font-size:14px;margin-right:4px;">⚡</span><span id="bravest-mobile-pill-text" style="color:#ffffff;font-weight:bold;font-size:13px;font-family:sans-serif;">' + preferredSpeed + 'x</span><span style="color:#ff7733;font-size:10px;margin-left:5px;">▲</span>';

                hud.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleMenu();
                });

                document.body.appendChild(hud);
            }

            function toggleMenu() {
                var menu = document.getElementById('bravest-mobile-menu');
                if (menu) {
                    menu.remove();
                    return;
                }

                menu = document.createElement('div');
                menu.id = 'bravest-mobile-menu';
                menu.style.cssText = 'position:fixed;bottom:120px;right:14px;z-index:9999999;background:rgba(18,18,28,0.96);border:1px solid #ff5500;border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:210px;box-shadow:0 8px 30px rgba(0,0,0,0.9);';

                SPEED_OPTIONS.forEach(function(spd) {
                    var btn = document.createElement('button');
                    btn.textContent = spd + 'x';
                    var isCurrent = Math.abs(spd - preferredSpeed) < 0.05;
                    btn.style.cssText = 'background:' + (isCurrent ? '#ff5500' : 'rgba(32,32,48,0.9)') + ';color:' + (isCurrent ? '#fff' : '#ddd') + ';font-weight:' + (isCurrent ? 'bold' : 'normal') + ';border:1px solid ' + (isCurrent ? '#ff5500' : 'rgba(255,255,255,0.1)') + ';border-radius:6px;padding:8px 0;font-size:13px;cursor:pointer;text-align:center;';

                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.bravestSetSpeed(spd);
                        menu.remove();
                    });

                    menu.appendChild(btn);
                });

                document.body.appendChild(menu);

                setTimeout(function() {
                    document.addEventListener('click', function closeMenu(ev) {
                        if (!menu.contains(ev.target)) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 10);
            }

            // 4. Auto Skip Video Ads
            function autoSkipAds() {
                var skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton, ytm-ad-slot-renderer');
                if (skipBtn && typeof skipBtn.click === 'function') skipBtn.click();

                var ad = document.querySelector('.ad-showing, .ad-interrupting');
                if (ad) {
                    document.querySelectorAll('video').forEach(function(v) {
                        if (!isNaN(v.duration) && v.duration > 0) v.currentTime = v.duration + 1;
                        v.playbackRate = 16.0;
                    });
                }
            }

            // 5. Enforcer Loop
            setInterval(function() {
                autoSkipAds();
                injectMobileHud();

                var video = document.querySelector('video');
                if (video && preferredSpeed && Math.abs(video.playbackRate - preferredSpeed) > 0.05) {
                    if (!document.querySelector('.ad-showing')) {
                        video.playbackRate = preferredSpeed;
                        video.preservesPitch = true;
                    }
                }
            }, 500);

            // Initial apply
            setTimeout(function() {
                window.bravestSetSpeed(preferredSpeed);
                injectMobileHud();
            }, 600);
        })();
    """.trimIndent()

    fun inject(webView: WebView) {
        webView.evaluateJavascript(SPEED_INJECTION_JS, null)
    }
}
