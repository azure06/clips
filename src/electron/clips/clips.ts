import { BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import * as isDev from 'electron-is-dev';
import { OAuth2Client } from 'google-auth-library';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { electronConfig } from '../electron.config';
import ClipboardService from '../services/clipboard/clipboard.service';
import GoogleDriveService, {
  DriveHandler
} from '../services/google-drive/google-drive.service';
import GoogleTranslate from '../services/google-translate/google-translate.service';
import GoogleOAuth2Service from '../services/oauth2/google-oauth2.service';

let mainWindow: Electron.BrowserWindow = null;

const initGoogleDrive = (oAuth2Client: OAuth2Client) => {
  const driveHandler = new DriveHandler();
  const googleDriveService = new GoogleDriveService(driveHandler);
  driveHandler.setDrive(oAuth2Client);
  let subscription: Subscription;

  ipcMain.on('add-to-drive', async (event, clip) => {
    googleDriveService.addClipToDrive(clip);
  });

  const unsubscribe = () => {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
    return Promise.resolve();
  };
  const subscribe = async (pageToken?: string) => {
    driveHandler.setPageToken(
      pageToken || (await driveHandler.getStartPageToken())
    );

    // Unsubscribe if necessary
    unsubscribe();
    subscription = googleDriveService.listenForChanges().subscribe(
      clips =>
        mainWindow.webContents.send('google-drive-change', {
          data: { clips }
        }),
      error =>
        mainWindow.webContents.send('google-drive-change', {
          error
        }),
      () => console.log('complete')
    );

    subscription.add(
      driveHandler
        .pageTokenAsObservable()
        .subscribe(pageToken =>
          mainWindow.webContents.send('page-token', { pageToken })
        )
    );
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
        const data = await googleTranslate.translate(text, options);
        mainWindow.webContents.send(eventId, { data });
      } catch (error) {
        mainWindow.webContents.send(eventId, { error });
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
    return googleOAuth2Service
      .openAuthWindowAndSetCredentials()
      .then(() =>
        googleDrive
          .getUserInfo()
          .then(userInfo =>
            mainWindow.webContents.send('user-info', userInfo.data.user)
          )
          .then(() => {
            // Sign-in status OK
            mainWindow.webContents.send('sign-in-result', { data: true });
          })
      )
      .catch(error => {
        mainWindow.webContents.send('sign-in-result', { error });
      });
  };
  ipcMain.on('sign-in', signIn);

  const onDriveSync = (
    event,
    { sync, pageToken }: { sync: boolean; pageToken: string }
  ) => {
    sync
      ? googleDrive
          .subscribe(pageToken)
          .then(() =>
            mainWindow.webContents.send('drive-sync-result', {
              data: { drive: { sync: true } }
            })
          )
          .catch(async error =>
            mainWindow.webContents.send('drive-sync-result', { error })
          )
      : googleDrive.unsubscribe().then(() =>
          mainWindow.webContents.send('drive-sync-result', {
            data: { drive: { sync: false } }
          })
        );
  };

  // Enable・Disable Drive sync
  ipcMain.on('drive-sync', onDriveSync);

  // Perform Sign-out
  const signOut = async event => {
    googleOAuth2Service
      .revokeCredentials()
      .then(result => {
        mainWindow.webContents.send('sign-out-result', { data: true });
      })
      .catch(error => {
        mainWindow.webContents.send('sign-out-result', { error });
      });
  };
  ipcMain.on('sign-out', signOut);
};

const handleClipboard = () => {
  const clipboardService = new ClipboardService();
  clipboardService.on('clipboard-change', clipboard =>
    mainWindow.webContents.send('clipboard-change', clipboard)
  );
  ipcMain.on('copy-to-clipboard', (event, data) => {
    clipboardService.copyToClipboard(data);
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    }
  });
};

const createMainWindow = () => {
  const isDevelopment = (isDev as any).default;
  const icon = nativeImage.createFromPath(
    path.join(`${__dirname}`, '../../assets/icon/clip.png')
  );
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 480,
    minHeight: 320,
    frame: false,
    show: false,
    resizable: true,
    skipTaskbar: true,
    icon
  });
  // mainWindow.focus();
  // and load the index.html of the app. try -> loadURL(`file://${__dirname}/index.html`)
  mainWindow.loadURL(
    isDevelopment
      ? 'http://localhost:4200'
      : path.join(`file://${__dirname}`, '../../index.html')
  );

  if (isDevelopment) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.once('did-finish-load', () => {
    handleClipboard();
  });

  // Handle new window event
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  // Emitted when the window is closed.
  mainWindow.on('closed', () => (mainWindow = null));
};

const initMainWindow = () => {
  createMainWindow();
  initGoogleServices();
};

export const isAvailable = () => !!mainWindow;
export default {
  get mainWindow() {
    return mainWindow;
  },
  initMainWindow
};
