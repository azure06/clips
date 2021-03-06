import { autoUpdaterObservable } from '../auto-updater';
import * as storeService from '../electron-store';
import { app, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import { AppConfState } from '@/store/types';
import {
  always,
  empty,
  whenAutoUpdateAvailable,
  whenMacOS,
} from '@/utils/environment';
import { Subscription } from 'rxjs';

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
        skipTaskbar: appConf.general.skipTaskbar,
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
  ...whenMacOS(always({ titleBarStyle: 'hidden' as const }), always({})),
  show: false,
  resizable: true,
  skipTaskbar: true,
  icon: path.join(__static, 'icon.png'),
};

let win: BrowserWindow | null = null;

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
    whenAutoUpdateAvailable<Subscription | void>(
      () => autoUpdaterObservable.subscribe(),
      empty
    );
  }
  win.on('close', () => {
    app.quit();
  });
  win.on('closed', () => {
    win = null;
  });
  win.webContents.once('did-finish-load', () => {
    win?.show();
  });
  return win;
}

function setAlwaysOnTop(win: BrowserWindow): (alwaysOnTop: boolean) => void {
  return (alwaysOnTop: boolean) => win.setAlwaysOnTop(alwaysOnTop);
}

function setSkipTaskbar(win: BrowserWindow): (skip: boolean) => void {
  return (skip: boolean) => win.setSkipTaskbar(skip);
}

export const mainWindow = {
  get instance(): BrowserWindow | null {
    return win;
  },
  create,
  setSkipTaskbar,
  setAlwaysOnTop,
};
