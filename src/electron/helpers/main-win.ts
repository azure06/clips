import { BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { storeService } from '../services/electron-store';
import path from 'path';
import { startAutoUpdater } from './auto-updater';

declare const __static: string;

const appSettings = storeService.getAppSettings();

const storeFlags = appSettings
  ? ((display) =>
      display.type === 'maintain'
        ? {
            width: display.width,
            height: display.height,
            x: display.position.x,
            y: display.position.y,
          }
        : { width: display.width, height: display.height })(appSettings.system.display)
  : {};

const flags = {
  width: 820,
  height: 410,
  minWidth: 640,
  minHeight: 360,
  webPreferences: {
    nodeIntegration: true,
  },
  frame: false,
  show: true,
  resizable: true,
  skipTaskbar: true,
  icon: path.join(__static, 'icon.png'),
  setSkipTaskbar: true,
};

let win: BrowserWindow | null = null;

function create() {
  win = new BrowserWindow({ ...flags, ...storeFlags });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
    // Start auto-updater
    startAutoUpdater();
  }
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export const mainWindow = {
  get instance() {
    return win;
  },
  create,
};
