/**
 * Bravest Browser - Main Process
 * Chromium runtime, Brave Shields integration, IPC routing, and YouTube 3x/4x engine
 */

const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const BraveShieldsEngine = require('./engine/shields/adblocker');

let mainWindow = null;
const shieldsEngine = new BraveShieldsEngine();

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    title: 'Bravest',
    backgroundColor: '#121217',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true
    }
  });

  // Load the Bravest UI
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Initialize Brave Shields in default session
  await shieldsEngine.initialize(session.defaultSession);

  // Forward Shields blocked stats to UI
  shieldsEngine.setOnBlockedListener((stats) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('shields-update', stats);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  // Custom user agent to ensure modern YouTube player features
  session.defaultSession.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Bravest/1.0'
  );

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// IPC Shields Controls
ipcMain.on('shields-toggle', (_, { enabled }) => {
  shieldsEngine.setShieldsEnabled(enabled);
});

ipcMain.handle('shields-get-stats', () => {
  return shieldsEngine.getBlockedStats();
});
