const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWin;

function createMainWindow() {
  mainWin = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWin.setMenuBarVisibility(false);
  mainWin.loadURL('https://self-order-lalala-cafe.vercel.app');

  // DevTools cho debug
  // mainWin.webContents.openDevTools();
}

app.whenReady().then(() => {
  createMainWindow();

  // ✅ Phím tắt thoát app
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    console.log('✅ Phím tắt Ctrl/Cmd+Shift+Q được nhấn – Thoát app');
    app.quit();
  });
});

ipcMain.handle('print-html', async (event, htmlContent) => {
  return new Promise(async (resolve) => {
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true },
    });

    printWin.webContents.openDevTools();

    printWin.webContents.on('did-start-loading', () =>
      console.log('➡️ did-start-loading'),
    );
    printWin.webContents.on('did-stop-loading', () =>
      console.log('✅ did-stop-loading'),
    );
    printWin.webContents.on('dom-ready', () => console.log('✅ dom-ready'));

    printWin.webContents.on('did-fail-load', (e, code, desc) => {
      console.error('❌ did-fail-load', code, desc);
      resolve({ success: false, error: desc });
      printWin.close();
    });

    printWin.webContents.on('did-finish-load', () => {
      console.log('✅ did-finish-load fired');

      printWin.webContents.print(
        { silent: true, printBackground: true },
        (success, errorType) => {
          console.log('✅ Print callback fired');
          if (!success) {
            console.error('❌ Print error:', errorType);
            resolve({ success: false, error: errorType });
          } else {
            console.log('✅ Print success');
            resolve({ success: true });
          }
          printWin.close();
        },
      );
    });

    console.log('Calling loadURL...');
    printWin.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
    );
    console.log('loadURL called!');
  });
});

// ✅ IPC: Thoát app từ renderer
ipcMain.on('exit-app', () => {
  console.log('✅ Renderer yêu cầu thoát app');
  app.quit();
});

// ✅ Clean up shortcut khi thoát
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ✅ Quit app khi tất cả cửa sổ đóng
app.on('window-all-closed', () => {
  app.quit();
});
