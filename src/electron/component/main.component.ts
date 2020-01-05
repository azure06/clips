import { BrowserWindow, nativeImage } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import { log, warn } from 'electron-log';

/* global __static */
declare const __static: string;

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
};

let mainWindow: BrowserWindow | null = null;

function create() {
  mainWindow = new BrowserWindow(flags);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  return mainWindow;
}

export default {
  get window() {
    return mainWindow;
  },
  create,
};
