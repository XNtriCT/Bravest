package com.bravest.browser

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.webkit.*
import android.widget.*
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var urlEditText: EditText
    private lateinit var btnShields: LinearLayout
    private lateinit var textShieldsCount: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnBack: ImageButton
    private lateinit var btnForward: ImageButton
    private lateinit var btnRefresh: ImageButton
    private lateinit var btnHome: ImageButton
    private lateinit var btnSpeedPill: TextView
    private lateinit var fullscreenContainer: FrameLayout

    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    private val shieldsEngine = ShieldsEngine()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupListeners()

        // Handle Android Back Navigation inside WebView
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (customView != null) {
                    hideFullscreenView()
                } else if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Initial launch: YouTube
        webView.loadUrl("https://www.youtube.com")
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        urlEditText = findViewById(R.id.urlEditText)
        btnShields = findViewById(R.id.btnShields)
        textShieldsCount = findViewById(R.id.textShieldsCount)
        progressBar = findViewById(R.id.progressBar)
        btnBack = findViewById(R.id.btnBack)
        btnForward = findViewById(R.id.btnForward)
        btnRefresh = findViewById(R.id.btnRefresh)
        btnHome = findViewById(R.id.btnHome)
        btnSpeedPill = findViewById(R.id.btnSpeedPill)
        fullscreenContainer = findViewById(R.id.fullscreenContainer)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = true
        settings.displayZoomControls = false
        settings.userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 Bravest/1.0"

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false)

        shieldsEngine.setOnBlockedListener { count ->
            runOnUiThread {
                textShieldsCount.text = count.toString()
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                return shieldsEngine.shouldIntercept(request) ?: super.shouldInterceptRequest(view, request)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                if (url != null && !urlEditText.hasFocus()) {
                    urlEditText.setText(url)
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                shieldsEngine.injectCosmeticFilter(webView)
                if (url != null && url.contains("youtube.com", ignoreCase = true)) {
                    YouTubeSpeedEngine.inject(webView)
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                customView = view
                customViewCallback = callback
                fullscreenContainer.addView(view)
                fullscreenContainer.visibility = View.VISIBLE
                webView.visibility = View.GONE
            }

            override fun onHideCustomView() {
                hideFullscreenView()
            }
        }
    }

    private fun hideFullscreenView() {
        if (customView == null) return
        fullscreenContainer.removeView(customView)
        fullscreenContainer.visibility = View.GONE
        webView.visibility = View.VISIBLE
        customViewCallback?.onCustomViewHidden()
        customView = null
        customViewCallback = null
    }

    private fun setupListeners() {
        // Omnibox URL load & Search
        urlEditText.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_GO ||
                actionId == EditorInfo.IME_ACTION_SEARCH ||
                (event != null && event.keyCode == KeyEvent.KEYCODE_ENTER)
            ) {
                val input = urlEditText.text.toString().trim()
                loadUrlOrSearch(input)
                hideKeyboard()
                true
            } else {
                false
            }
        }

        btnBack.setOnClickListener { if (webView.canGoBack()) webView.goBack() }
        btnForward.setOnClickListener { if (webView.canGoForward()) webView.goForward() }
        btnRefresh.setOnClickListener { webView.reload() }
        btnHome.setOnClickListener { webView.loadUrl("https://search.brave.com") }

        // Shields Popup
        btnShields.setOnClickListener {
            showShieldsDialog()
        }

        // Speed Menu Popup
        btnSpeedPill.setOnClickListener {
            showSpeedDialog()
        }
    }

    private fun loadUrlOrSearch(input: String) {
        if (input.isEmpty()) return
        val url = if (input.startsWith("http://") || input.startsWith("https://")) {
            input
        } else if (input.contains(".") && !input.contains(" ")) {
            "https://$input"
        } else {
            "https://search.brave.com/search?q=" + java.net.URLEncoder.encode(input, "UTF-8")
        }
        webView.loadUrl(url)
    }

    private fun showShieldsDialog() {
        val status = if (shieldsEngine.shieldsEnabled) "Active" else "Disabled"
        MaterialAlertDialogBuilder(this)
            .setTitle("🦁 Brave Shields Protection")
            .setMessage("Status: $status\n\nBlocked Trackers & Ads: ${shieldsEngine.blockedCount}\n\nFeatures:\n✓ YouTube Video Ads Blocked\n✓ 3.0x & 4.0x Playback Turbo\n✓ Background Audio Playback")
            .setPositiveButton(if (shieldsEngine.shieldsEnabled) "Turn Off" else "Turn On") { _, _ ->
                shieldsEngine.shieldsEnabled = !shieldsEngine.shieldsEnabled
                webView.reload()
            }
            .setNegativeButton("Close", null)
            .show()
    }

    private fun showSpeedDialog() {
        val speeds = arrayOf("0.5x", "1.0x (Normal)", "1.25x", "1.5x", "1.75x", "2.0x", "2.5x", "3.0x (Turbo)", "3.5x", "4.0x (Ultra)")
        val speedValues = floatArrayOf(0.5f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f, 2.5f, 3.0f, 3.5f, 4.0f)

        MaterialAlertDialogBuilder(this)
            .setTitle("⚡ Select Playback Speed")
            .setItems(speeds) { _, which ->
                val selected = speedValues[which]
                btnSpeedPill.text = "${selected}x"
                webView.evaluateJavascript("if (window.bravestSetSpeed) window.bravestSetSpeed($selected);", null)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun hideKeyboard() {
        val imm = getSystemService(INPUT_METHOD_SERVICE) as? InputMethodManager
        imm?.hideSoftInputFromWindow(urlEditText.windowToken, 0)
        urlEditText.clearFocus()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
