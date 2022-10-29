import { empty, whenWindows } from '@/utils/environment';
import { BrowserWindow, Menu, Tray, app, nativeImage } from 'electron';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* global __static */
declare const __static: string;

let _tray: Tray | null = null;

function create(mainWindow: BrowserWindow): void {
  const nativeImg = nativeImage.createFromPath(path.join(__static, 'icon.png'));
  _tray = new Tray(
    nativeImg.resize({ width: 16, height: 16, quality: 'best' })
  );
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Clips              ',
      enabled: true,
      click() {
        mainWindow.show();
      },
    },
    { type: 'separator' },
    // { label: '  Pause Syncing' },
    {
      label: 'Preferences       ',
      click() {
        mainWindow.show();
        mainWindow.webContents.send('navigate', { name: 'settings' });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit       ',
      accelerator: 'CmdOrCtrl+Q',
      click() {
        app.quit();
      },
    },
  ]);
  _tray.setToolTip('Clips');
  _tray.setContextMenu(contextMenu);
  _tray.on('click', () => {
    whenWindows(() => mainWindow.show(), empty);
    // if (mainWindow.isVisible()) {
    //    mainWindow.hide();
    // } else {
    //   mainWindow.show();
    // }
  });
}

export const tray = {
  get instance(): Tray | null {
    return _tray;
  },
  create,
};
