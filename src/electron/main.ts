// tslint:disable-next-line: no-implicit-dependencies
import { app, BrowserWindow, ipcMain } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import * as url from 'url';
import { electronConfig } from './electron-config';
import ElectronGoogleOAuth2 from './electron-google-oauth2';

let mainWindow: Electron.BrowserWindow;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: isDev ? true : false
  });

  console.error('Directory', __dirname, isDev);
  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev ? 'http://localhost:4200' : path.join(__dirname, '../index.html')
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const googleOAuth2 = new ElectronGoogleOAuth2(electronConfig.googleOAuth2);

  googleOAuth2.onTokensRefresh(authTokens =>
    mainWindow.webContents.send('oauth2tokens-refresh', authTokens)
  );

  ipcMain.on('oauth2tokens', async (event, authTokens) => {
    authTokens
      ? googleOAuth2.setCredentials(authTokens)
      : await googleOAuth2.openAuthWindowAndSetCredentials();
  });

  ipcMain.on('client-load', () => {
    mainWindow.webContents.send(
      'oauth2-client',
      googleOAuth2.getOAuth2Client()
    );
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});
