import { app, nativeImage, Tray, Menu, BrowserWindow } from 'electron';
import path from 'path';

/* global __static */
declare const __static: string;

let tray: Tray | null = null;

function create(mainWindow: BrowserWindow) {
  const nativeImg = nativeImage.createFromPath(path.join(__static, 'icon.png'));
  tray = new Tray(nativeImg.resize({ width: 16, height: 16, quality: 'best' }));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Clips              ', enabled: false },
    { type: 'separator' },
    // { label: '  Pause Syncing' },
    {
      label: 'Preferences       ',
      click() {
        mainWindow.show();
        mainWindow.webContents.send('preference-click');
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
  tray.setToolTip('Clips');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

export default {
  get tray() {
    return tray;
  },
  create,
};
