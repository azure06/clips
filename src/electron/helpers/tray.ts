import { app, nativeImage, Tray, Menu, BrowserWindow } from 'electron';
import path from 'path';

/* global __static */
declare const __static: string;

let _tray: Tray | null = null;

function create(mainWindow: BrowserWindow) {
  const nativeImg = nativeImage.createFromPath(path.join(__static, 'icon.png'));
  _tray = new Tray(nativeImg.resize({ width: 16, height: 16, quality: 'best' }));
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
      accelerator: 'Command+Q',
      click() {
        app.quit();
      },
    },
  ]);
  _tray.setToolTip('Clips');
  _tray.setContextMenu(contextMenu);
  _tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

export const tray = {
  get instance() {
    return _tray;
  },
  create,
};
