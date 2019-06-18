import {
  app,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Tray
} from 'electron';
import * as path from 'path';
import './analytics';
import './auto-launcher';
import './auto-updater';
import clips, { isAvailable } from './clips/clips';

const appLocked = app.requestSingleInstanceLock();

!appLocked
  ? app.quit()
  : (() => {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (clips.mainWindow) {
          if (!clips.mainWindow.isVisible()) {
            clips.mainWindow.show();
          }
        }
      });

      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.on('ready', clips.initMainWindow);

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
          clips.initMainWindow();
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
        tray = new Tray(
          nativeImg.resize({ width: 16, height: 16, quality: 'best' })
        );
        const contextMenu = Menu.buildFromTemplate([
          { label: '  Infiniti Clips              ', enabled: false },
          { type: 'separator' },
          // { label: '  Pause Syncing' },
          {
            label: '  Preferences',
            click() {
              clips.mainWindow.show();
              clips.mainWindow.webContents.send('navigate', {
                routeUrl: 'preferences/iam'
              });
            }
          },
          { type: 'separator' },
          {
            label: '  Quit',
            accelerator: 'Command+Q',
            click() {
              app.quit();
            }
          }
        ]);
        tray.setToolTip('Infiniti Clips');
        tray.setContextMenu(contextMenu);
        tray.setHighlightMode('selection');
        tray.on('click', () => {
          clips.mainWindow.isVisible()
            ? clips.mainWindow.hide()
            : clips.mainWindow.show();
        });

        // Set Keyboard Shortcuts
        ipcMain.on('app-settings', (event, { newSettings, oldSettings }) => {
          if (
            oldSettings &&
            oldSettings.hotkeys.open === newSettings.hotkeys.open
          ) {
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
              clips.mainWindow.isVisible()
                ? clips.mainWindow.hide()
                : clips.mainWindow.show();
            }
          );
        });
      });

      app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
      });
    })();
