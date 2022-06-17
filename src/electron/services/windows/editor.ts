import { BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import { always, whenMacOS } from '@/utils/environment';

declare const __static: string;

const flags = {
  width: 920,
  height: 620,
  webPreferences: {
    // Use pluginOptions.nodeIntegration, leave this alone
    // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
    nodeIntegration: true,
    contextIsolation: false,
    //  (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
    additionalArguments: [],
    enableRemoteModule: true, // https://www.electronjs.org/docs/latest/breaking-changes
  },
  frame: false,
  ...whenMacOS(always({ titleBarStyle: 'hidden' as const }), always({})),
  show: true,
  resizable: true,
  skipTaskbar: true,
  icon: path.join(__static, 'icon.png'),
  setSkipTaskbar: true,
};

let win: BrowserWindow | null = null;

function create(clipdId: string): BrowserWindow {
  win = new BrowserWindow({
    ...flags,
    webPreferences: {
      ...flags.webPreferences,
      additionalArguments: [`--clip-id=${clipdId}`],
    },
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export const editorWindow = {
  get instance(): BrowserWindow | null {
    return win;
  },
  create,
};
