const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWin;

function createMainWindow() {
  mainWin = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWin.loadURL('https://4ddfea3b82af.ngrok-free.app');
}

app.whenReady().then(createMainWindow);

// Lắng nghe web gọi in
ipcMain.on('print-html', async (event, htmlContent) => {
  // Tạo 1 cửa sổ ẩn để render HTML đó
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
    },
  });

  await printWin.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
  );

  printWin.webContents.on('did-finish-load', () => {
    printWin.webContents.print(
      {
        silent: true, // ✅ In ẩn không hiện popup
        printBackground: true, // ✅ In luôn CSS background
      },
      (success, errorType) => {
        if (!success) console.error('Print error:', errorType);
        printWin.close(); // ✅ In xong tự đóng
      },
    );
  });
});

app.on('window-all-closed', () => app.quit());
