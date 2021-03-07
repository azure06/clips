'use strict';

import { onReady, onActivate } from './electron';
import { app, protocol, globalShortcut } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import {
  always,
  empty,
  whenDevelopment,
  whenMacOS,
  whenMas,
} from './utils/environment';

// The return value of this method indicates whether or not this instance of your application successfully obtained the lock
const appLocked =
  whenMas(always(true), always(false)) || app.requestSingleInstanceLock();

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
        whenMacOS(empty, () => app.quit());
      });

      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      app.on('activate', onActivate);

      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.on('ready', async () => {
        whenDevelopment(async () => {
          if (process.env.IS_TEST) return;
          await installExtension(VUEJS_DEVTOOLS);
          // Make it work with vue3 ???
          await installExtension({
            id: 'ljjemllljcmogpfapbkkighbhhppjdbg',
            electron: '>=1.2.1',
          });
        }, always(Promise.resolve())).catch((e) =>
          console.error('Vue Devtools failed to install:', e.toString())
        );
        onReady();
      });

      app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
      });

      // Exit cleanly on request from parent process in development mode.
      whenDevelopment(() => {
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
      }, empty);
    })();
