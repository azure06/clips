import { autoUpdaterObservable } from '../auto-updater';
import * as storeService from '../electron-store';
import { app, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import { AppConfState } from '@/store/types';
import { onSetAlwaysOnTop } from '../../../utils/invocation-handler';
import { isMacOS, isMas } from '@/utils/environment';

declare const __static: string;

const appConf = storeService.getAppConf();

const storeFlags = (
  appConf: AppConfState | undefined
): Electron.BrowserWindowConstructorOptions =>
  appConf
    ? ((): Electron.BrowserWindowConstructorOptions => ({
        ...(appConf.general.positioningMode.type === 'maintain'
          ? {
              width: appConf.general.positioningMode.width,
              height: appConf.general.positioningMode.height,
              x: appConf.general.positioningMode.position.x,
              y: appConf.general.positioningMode.position.y,
            }
          : {
              width: appConf.general.positioningMode.width,
              height: appConf.general.positioningMode.height,
            }),
        alwaysOnTop: appConf.general.alwaysOnTop,
      }))()
    : {};

const flags = {
  width: 820,
  height: 410,
  minWidth: 480,
  minHeight: 360,
  webPreferences: {
    // Use pluginOptions.nodeIntegration, leave this alone
    // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
    nodeIntegration: true,
    //  (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
  },
  frame: false,
  ...(isMacOS ? { titleBarStyle: 'hidden' as const } : {}),
  show: true,
  resizable: true,
  skipTaskbar: true,
  icon: path.join(__static, 'icon.png'),
  setSkipTaskbar: true,
};

let win: BrowserWindow | null = null;

onSetAlwaysOnTop((alwaysOnTop) => {
  if (win) {
    win.setAlwaysOnTop(alwaysOnTop);
    return Promise.resolve({ status: 'success' as const, data: alwaysOnTop });
  } else {
    return Promise.resolve({
      status: 'failure' as const,
      message: 'Failed to set always on top',
    });
  }
});

function create(): BrowserWindow {
  win = new BrowserWindow({ ...flags, ...storeFlags(appConf) });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
    // Start auto-updater
    if (!isMas) autoUpdaterObservable.subscribe();
  }
  win.on('close', () => {
    app.quit();
  });
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export const mainWindow = {
  get instance(): BrowserWindow | null {
    return win;
  },
  create,
};
