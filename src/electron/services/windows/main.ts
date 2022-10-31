import path from 'path';

import { BrowserWindow, app } from 'electron';
import { Subscription } from 'rxjs';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

import { ActionGetCurrentWindow } from '@/renderer/invokers/remote';
import {
  always,
  empty,
  whenAutoUpdateAvailable,
  whenMacOS,
} from '@/utils/environment';

import { AppConfState } from '../../../renderer/store/types';
import { autoUpdaterObservable } from '../auto-updater';
import * as storeService from '../electron-store';

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
    contextIsolation: false,
    //  (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
    enableRemoteModule: true, // https://www.electronjs.org/docs/latest/breaking-changes
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

// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'isVisible'>(action: ActionGetCurrentWindow, payload: boolean) => boolean;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'isMaximized'>(action: ActionGetCurrentWindow, payload: boolean) => boolean;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'maximize'>(action: ActionGetCurrentWindow) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'minimize'>(action: ActionGetCurrentWindow) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'hide'>(action: ActionGetCurrentWindow) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'close'>(action: ActionGetCurrentWindow) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'setAlwaysOnTop'>(action: ActionGetCurrentWindow, payload: boolean) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T extends 'setSkipTaskbar'>(action: ActionGetCurrentWindow, payload: boolean) => void;
// prettier-ignore
function onGetCurrentWindow(win: BrowserWindow): <T1 extends ActionGetCurrentWindow, T2 extends boolean>(action: ActionGetCurrentWindow, payload?: T2) => any {
  return (action, payload) => {
    switch (action) {
      case 'isVisible':
        return win.isVisible();
      case 'isMaximized':
        return win.isMaximized();
      case 'maximize':
        return win.maximize();
      case 'minimize':
        return win.minimize();
      case 'unmaximize':
        return win.unmaximize();
      case 'hide':
        return win.hide();
      case 'close':
        return win.close();
      case 'getBounds':
        return win.getBounds();
      case 'setAlwaysOnTop':
        return payload ? win.setAlwaysOnTop(payload) : void 0;
      case 'setSkipTaskbar':
        return payload ? win.setSkipTaskbar(payload) : void 0;
    }
  };
}

export const mainWindow = {
  get instance(): BrowserWindow | null {
    return win;
  },
  create,
  onGetCurrentWindow,
};
