'use strict';

import { app, protocol, globalShortcut, BrowserWindow } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { onReady, onActivate } from './electron';
const isDevelopment = process.env.NODE_ENV !== 'production';

const appLocked = app.requestSingleInstanceLock();

!appLocked
  ? app.quit()
  : (() => {
      // Scheme must be registered before the app is ready
      protocol.registerSchemesAsPrivileged([
        { scheme: 'app', privileges: { secure: true, standard: true } },
      ]);

      // Quit when all windows are closed.
      app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      app.on('activate', onActivate);

      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.on('ready', async () => {
        if (isDevelopment && !process.env.IS_TEST) {
          // Install Vue Devtools
          try {
            await installExtension(VUEJS_DEVTOOLS);
            // Make it work with vue3 ???
            await installExtension({
              id: 'ljjemllljcmogpfapbkkighbhhppjdbg',
              electron: '>=1.2.1',
            });
          } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString());
          }
        }

        onReady();
      });

      app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
      });

      // Exit cleanly on request from parent process in development mode.
      if (isDevelopment) {
        if (process.platform === 'win32') {
          process.on('message', (data) => {
            if (data === 'graceful-exit') {
              app.quit();
            }
          });
        } else {
          process.on('SIGTERM', () => {
            app.quit();
          });
        }
      }
    })();
