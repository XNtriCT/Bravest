# 🦡 Bravest Browser

> An exact fork of **Brave Browser** with all signature Brave Shields ad-blocking and privacy features, enhanced with native **3x and 4x YouTube playback speed multipliers**.

![Bravest Browser](https://img.shields.io/badge/Bravest-Brave%20Fork-ff5500?style=for-the-badge&logo=brave)
![Ad Blocker](https://img.shields.io/badge/Brave%20Shields-Active-2ed573?style=for-the-badge)
![YouTube Speeds](https://img.shields.io/badge/YouTube%20Speeds-0.25x%20to%204.0x-ff7700?style=for-the-badge)
![Android APK](https://img.shields.io/badge/Android%20APK-v1.1.0%20Available-green?style=for-the-badge&logo=android)
![Windows EXE](https://img.shields.io/badge/Windows%20EXE-Portable%20Ready-blue?style=for-the-badge&logo=windows)

### 🔗 Downloads & Releases
* **💻 Windows Standalone Executable**: [`Bravest.exe`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/Bravest.exe) / Double-click `Bravest.lnk`
* **📱 Android APK (v1.1.0)**: [Download Bravest.apk](https://github.com/XNtriCT/Bravest/releases/download/v1.1.0/Bravest.apk) / Local [`Bravest.apk`](file:///c:/Users/merin/Documents/My%20Automations/Random%20Ideas/Bravest/Bravest.apk)
* **📦 GitHub Release v1.1.0**: [https://github.com/XNtriCT/Bravest/releases/tag/v1.1.0](https://github.com/XNtriCT/Bravest/releases/tag/v1.1.0)
* **🐙 GitHub Repository**: [https://github.com/XNtriCT/Bravest](https://github.com/XNtriCT/Bravest)

---

## ✨ Features

- **🦁 Full Brave Shields Engine**:
  - Blocks banner ads, tracking scripts, and popups.
  - Automatically strips YouTube video ads (pre-rolls and mid-rolls).
  - Real-time tracker & ad blocked counter in the Omnibox.
- **⚡ Native 3x & 4x YouTube Playback Speeds**:
  - Play any YouTube video at **3.0x** and **4.0x** speeds (in addition to 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3.5x).
  - Extended keyboard shortcuts (`Shift + >` and `Shift + <`) scale all the way up to **4x** in 0.25x increments.
  - On-Player HUD with one-click quick speed selectors (`1x`, `1.5x`, `2x`, `3x`, `4x`).
  - Integrated into YouTube's native Settings gear popup menu.
  - Smooth audio pitch preservation (`preservesPitch = true`) so voices remain clear and undistorted.
  - Speed memory: remembers your preferred speed across videos.
- **🌐 Brave UI & Aesthetics**:
  - Modern Brave dark theme with orange highlights and glassmorphism.
  - Multi-tab management with draggable tabs.
  - Omnibox with Brave Search integration.
  - Quick bookmark bar and window controls.

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
