import {
  app,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Tray
} from 'electron';
import * as path from 'path';
import cloudClips, { isAvailable } from './cloud-clips/cloud-clips.main';

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', cloudClips.initMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!isAvailable) {
    cloudClips.initMainWindow();
  }
});

// Disable window menu
app.on('browser-window-created', (event, window) => {
  window.setMenu(null);
});

let tray = null;
app.on('ready', () => {
  // FIXME It doesn't works without building the app
  const nativeImg = nativeImage.createFromPath(
    path.join(`${__dirname}`, '../assets/icon/clip.png')
  );

  // Set tray
  tray = new Tray(nativeImg);
  const contextMenu = Menu.buildFromTemplate([
    { label: '  Infiniti Clips              ', enabled: false },
    { type: 'separator' },
    // { label: '  Pause Syncing' },
    { label: '  Preferences' },
    { type: 'separator' },
    {
      label: '  Quit',
      accelerator: 'Command+Q',
      click() {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
  tray.setHighlightMode('selection');
  tray.on('click', () => {
    cloudClips.mainWindow.isVisible()
      ? cloudClips.mainWindow.hide()
      : cloudClips.mainWindow.show();
  });

  // Set Keyboard Shortcuts
  ipcMain.on('app-settings', (event, { newSettings, oldSettings }) => {
    if (oldSettings && oldSettings.hotkeys.open === newSettings.hotkeys.open) {
      return;
    }
    if (oldSettings) {
      globalShortcut.unregister(
        process.platform === 'darwin'
          ? `Shift+Command+${oldSettings.hotkeys.open}`
          : `Ctrl+Alt+${oldSettings.hotkeys.open}`
      );
    }
    globalShortcut.register(
      process.platform === 'darwin'
        ? `Shift+Command+${newSettings.hotkeys.open}`
        : `Ctrl+Alt+${newSettings.hotkeys.open}`,
      () => {
        cloudClips.mainWindow.isVisible()
          ? cloudClips.mainWindow.hide()
          : cloudClips.mainWindow.show();
      }
    );
  });
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
