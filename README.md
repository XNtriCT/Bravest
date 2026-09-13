# 🦡 Bravest Browser

> An exact fork of **Brave Browser** with all signature Brave Shields ad-blocking and privacy features, enhanced with a dedicated **single-tap 1x to 4x playback speed toolbar** and **Windows Aero Snap window management**.

![Bravest Browser](https://img.shields.io/badge/Bravest-Brave%20Fork-ff5500?style=for-the-badge&logo=brave)
![Version](https://img.shields.io/badge/Version-v1.2.0-orange?style=for-the-badge)
![Ad Blocker](https://img.shields.io/badge/Brave%20Shields-Active-2ed573?style=for-the-badge)
![YouTube Speeds](https://img.shields.io/badge/Video%20Speeds-0.75x%20to%204.0x-ff7700?style=for-the-badge)
![Android APK](https://img.shields.io/badge/Android%20APK-v1.1.0%20Available-green?style=for-the-badge&logo=android)
![Windows EXE](https://img.shields.io/badge/Windows%20EXE-Portable%20Ready-blue?style=for-the-badge&logo=windows)

### 🔗 Downloads & Releases
* **💻 Windows Primary Executable**: [`dist/win-unpacked/Bravest.exe`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/dist/win-unpacked/Bravest.exe) / Double-click `Bravest.lnk`
* **💻 Windows Standalone Portable**: [`Bravest.exe`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/Bravest.exe)
* **📱 Android APK (v1.1.0)**: [Download Bravest.apk](https://github.com/XNtriCT/Bravest/releases/download/v1.1.0/Bravest.apk) / Local [`Bravest.apk`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/Bravest.apk)
* **🐙 GitHub Repository**: [https://github.com/XNtriCT/Bravest](https://github.com/XNtriCT/Bravest)

---

## ✨ Features

- **🦁 Full Brave Shields Engine**:
  - Blocks banner ads, tracking scripts, and popups.
  - Automatically strips YouTube video ads (pre-rolls and mid-rolls).
  - Real-time tracker & ad blocked counter in the Omnibox.
- **⚡ Linear Single-Tap Speed Toolbar (0.75x to 4x)**:
  - Instant one-tap speed buttons located directly below the URL bar: `0.75x`, `1x`, `1.25x`, `1.5x`, `1.75x`, `2x`, `2.25x`, `2.5x`, `2.75x`, `3x`, `3.5x`, `4x`.
  - Live active indicator: currently active speed glows in Brave Orange (`#fb542b`).
  - Extended keyboard shortcuts (`Shift + >` and `Shift + <`) scale smoothly up to **4x**.
  - Smooth audio pitch preservation (`preservesPitch = true`) keeping voices clear and natural.
  - Speed memory: remembers your preferred playback speed across sessions.
- **🪟 Windows Aero Snap & Window Management**:
  - Drag the browser window smoothly from anywhere across the titlebar.
  - Full Windows Aero Snap support: drag to top to maximize, drag to left/right screen edges to snap and pin side-by-side.
  - Double-click titlebar to toggle maximize and restore.
  - Standard edge and corner resizing with dynamic maximize/restore icon toggle.
- **🌐 Brave UI & Aesthetics**:
  - Modern Brave dark theme with orange accents and glassmorphism.
  - Multi-tab management with draggable tabs and fast keyboard navigation.
  - Omnibox with Brave Search integration.

---

## 🚀 Quick Start (Running Bravest Locally)

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Start the browser
```bash
npm start
```

---

## ⌨️ YouTube Speed Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Shift` + `>`** | Increase playback speed (scales up to **4.0x**) |
| **`Shift` + `<`** | Decrease playback speed (scales down to **0.25x**) |
| **`Ctrl` + `T`** | Open new tab |
| **`Ctrl` + `W`** | Close current tab |
| **`Ctrl` + `L`** | Focus Omnibox address bar |

---

## 🧩 Standalone Extension (For Existing Brave / Chrome)

If you wish to use the YouTube 3x/4x speed engine inside an existing installation of Brave Browser:

1. Open `brave://extensions` in Brave.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the [`extension/`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/extension) folder.
4. Open YouTube and enjoy 3x and 4x playback speeds immediately!

---

## 🛠️ Building Native Brave C++ Binary from Source

To compile the full native C++ Brave binary using `brave-core`:

1. Refer to [BUILD_BRAVE_FROM_SOURCE.md](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/BUILD_BRAVE_FROM_SOURCE.md).
2. The patch file [`patches/brave_core_youtube_speeds.patch`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/patches/brave_core_youtube_speeds.patch) applies the modifications to `src/brave`.
3. Automated helper scripts are located in [`scripts/fork_and_setup.ps1`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/scripts/fork_and_setup.ps1) and [`scripts/build_brave.ps1`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/scripts/build_brave.ps1).

---

## 📄 License
Mozilla Public License 2.0 (MPL-2.0) matching Brave upstream.
