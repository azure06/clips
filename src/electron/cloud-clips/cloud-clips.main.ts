import { BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import * as isDev from 'electron-is-dev';
import { OAuth2Client } from 'google-auth-library';
import * as path from 'path';
import GoogleTranslate from '../services/google-translate/google-translate.service';
import { electronConfig } from './../electron.config';
import ClipboardService from './../services/clipboard/clipboard.service';
import GoogleDriveService from './../services/google-drive/google-drive.service';
import GoogleOAuth2Service from './../services/oauth2/google-oauth2.service';

let mainWindow: Electron.BrowserWindow = null;

const initGoogleDrive = (oAuth2Client: OAuth2Client) => {
  const googleDriveService = new GoogleDriveService(oAuth2Client);
  let subscription;

  ipcMain.on('add-to-drive', async (event, clip) => {
    googleDriveService.addClipToDrive(clip);
  });
  const subscribe = async () => {
    const pageToken = await googleDriveService.getStartPageToken();

    subscription = googleDriveService
      .listenForChanges(pageToken)
      .subscribe(
        data => mainWindow.webContents.send('google-drive-change', data),
        err => console.log('ERROR: ', err),
        () => console.log('complete')
      );
  };
  const unsubscribe = () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };

  const getUserInfo = () => googleDriveService.getUserInfo();

  return { subscribe, unsubscribe, getUserInfo };
};

const initGoogleTranslate = () => {
  const googleTranslate = new GoogleTranslate();
  ipcMain.on(
    'google-translate-query',
    async (event, { eventId, text, options }) => {
      try {
        const result = await googleTranslate.translate(text, options);
        mainWindow.webContents.send(eventId, result);
      } catch (error) {
        mainWindow.webContents.send(eventId, error);
        console.error('google translate error - ', error);
      }
    }
  );
};

const initGoogleServices = () => {
  const googleOAuth2Service = new GoogleOAuth2Service(
    electronConfig.googleOAuth2
  );
  const googleDrive = initGoogleDrive(googleOAuth2Service.getOAuth2Client());
  initGoogleTranslate();

  // This method will be called when oatuh-tokens have been refreshed
  googleOAuth2Service.on('tokens', authTokens =>
    mainWindow.webContents.send('oauth2tokens-refresh', authTokens)
  );

  // Set oatuh2 credentials, and initialize Google Drive Service
  ipcMain.on('client-ready', async (event, authTokens) => {
    if (authTokens) {
      googleOAuth2Service.setCredentials(authTokens);
    }
  });

  // Perform sign-in and get userinfo
  const signIn = async (event?) => {
    const signInResult = await googleOAuth2Service.openAuthWindowAndSetCredentials();
    if (signInResult) {
      googleDrive
        .getUserInfo()
        .then(userInfo =>
          mainWindow.webContents.send('user-info', userInfo.data.user)
        )
        .catch(error => console.error(error));
    }
    mainWindow.webContents.send('sign-in-result', signInResult);
  };
  ipcMain.on('sign-in', signIn);

  // Enable・Disable Drive sync
  ipcMain.on('drive-sync', async (event, driveSync) => {
    try {
      driveSync ? await googleDrive.subscribe() : googleDrive.unsubscribe();
    } catch (error) {
      await signIn();
      googleDrive.subscribe();
    }
  });

  // Perform Sign-out
  const signOut = async event => {
    googleDrive.unsubscribe();

    googleOAuth2Service
      .revokeCredentials()
      .then(result => {
        mainWindow.webContents.send('sign-out-result', result.status === 200);
      })
      .catch(error => {
        mainWindow.webContents.send('sign-out-result', error);
      });
  };
  ipcMain.on('sign-out', signOut);
};

const handleClipboard = () => {
  const clipboardService = new ClipboardService();
  clipboardService.on('clipboard-change', clipboard =>
    mainWindow.webContents.send('clipboard-change', clipboard)
  );
};

const createWindow = () => {
  const isDevelopment = (isDev as any).default;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false
  });
  mainWindow.setResizable(true);
  mainWindow.focus();

  const icon = nativeImage.createFromPath(
    path.join(`${__dirname}`, '../../assets/icon/clip.png')
  );

  // and load the index.html of the app. try -> loadURL(`file://${__dirname}/index.html`)
  mainWindow.loadURL(
    isDevelopment
      ? 'http://localhost:4200'
      : path.join(`file://${__dirname}`, '../../index.html')
  );

  // Set icon.
  mainWindow.setIcon(icon);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  // On resize.
  ipcMain.on('resize', (event, { width, height, animate }) => {
    mainWindow.setSize(width, height, animate);
  });
  // Center
  ipcMain.on('center', event => {
    mainWindow.center();
  });
  // On reposition.
  ipcMain.on('change-position', (event, { x, y, animate }) => {
    mainWindow.setPosition(x, y, animate);
  });

  mainWindow.webContents.once('did-finish-load', () => {
    handleClipboard();
  });

  initGoogleServices();

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  // Emitted when the window is closed.
  mainWindow.on('closed', () => (mainWindow = null));
};

export const isAvailable = () => !!mainWindow;
export default {
  createWindow
};
