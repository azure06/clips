import { BrowserWindow, ipcMain } from 'electron';
// import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import clipboardService from './service/clipboard.service';
import { GoogleOAuth2Service } from './service/google-auth.service';
import { GoogleDriveService } from './service/google-drive.service';
import { tap } from 'rxjs/operators';
import { environment } from './environment.config';
import mainComponent from './component/main.component';
import trayComponent from './component/tray.component';
import Sentry from './sentry';
import shortcutUtil, { fromFuzzyShortcut as fromFuzzy } from './utils/shortcut.util';
import storeService from './service/electron-store.service';

Sentry.init(environment.sentry);

/**
 *  Subscribe to Google Services
 *  - Google Auth
 *  - Google Drive
 *
 * @param mainWindow BrowserWindows
 */
function googleSubscriptions(mainWindow: BrowserWindow) {
  const authService = new GoogleOAuth2Service(environment.googleOAuth2);
  const driveService = new GoogleDriveService(authService.getOAuth2Client());
  const credentials = storeService.getCredentials();
  const pageToken = storeService.getPageToken();

  if (credentials) {
    authService.setCredentials(credentials);
  }

  if (pageToken) {
    driveService.setPageToken(pageToken);
  }

  /** Keep updating credentials */
  authService
    .credentialsAsObservable()
    .pipe(tap(storeService.setCredentials))
    .subscribe();

  /** Keep updating google drive page-token */
  driveService
    .pageTokenAsObservable()
    .pipe(tap(storeService.setPageToken))
    .subscribe();

  ipcMain.handle('sign-in', () => {
    return authService
      .openAuthWindowAndSetCredentials()
      .then((_: any) => driveService.getUserInfo())
      .catch(Sentry.captureException);
  });

  ipcMain.handle('sign-out', () => {
    storeService.removeCredentials();
    return authService.revokeCredentials().catch(Sentry.captureException);
  });

  ipcMain.handle('list-files', (_) => {
    return driveService.listFiles().catch((error) => {
      Sentry.captureException(error);
      return { error };
    });
  });

  ipcMain.handle('upload-to-drive', (_, data: any[]) => {
    return driveService.addFile(data).catch((error) => {
      Sentry.captureException(error);
      return { error };
    });
  });
}

function clipboardSubscriptions(mainWindow: BrowserWindow) {
  const { clipboardAsObservable: clipboard, copyToClipboard } = clipboardService;
  clipboard
    .pipe(
      tap((clip) => {
        mainWindow.webContents.send('clipboard-change', clip);
      })
    )
    .subscribe();

  ipcMain.handle('copy-to-clipboard', (event, type, content) => {
    return copyToClipboard(type, content);
  });
}

/** Handle Shortcuts */
function handleShortcuts(mainWindow: BrowserWindow) {
  const settings = storeService.getAppSettings();
  const storedShortcut = settings ? fromFuzzy(settings.system.shortcut) : undefined;
  const onShortcutPressed = () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
  shortcutUtil.register(storedShortcut, onShortcutPressed);
  ipcMain.handle('change-shortcut', (_, shortcut) =>
    shortcutUtil.register(fromFuzzy(shortcut), onShortcutPressed)
  );
}

export function onReady() {
  const mainWindow = mainComponent.create();
  const _ = trayComponent.create(mainWindow);

  /** Subscribe to all services */
  clipboardSubscriptions(mainWindow);
  googleSubscriptions(mainWindow);
  handleShortcuts(mainWindow);
}

export function onActivate() {
  const _ = mainComponent.window ? mainComponent.window : mainComponent.create();
}
