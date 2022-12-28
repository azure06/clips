import { dialog, ipcMain } from 'electron';

import { INVOCATION } from '@/utils/constants';

import {
  ActionDialog,
  ActionGetCurrentWindow,
} from '../../renderer/invokers/remote';

export const onGetCurrentWindow = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (action: ActionGetCurrentWindow, payload: any) => any
): void =>
  ipcMain.handle(
    INVOCATION.REMOTE.GET_CURRENT_WINDOW,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event, action: ActionGetCurrentWindow, payload: any) =>
      func(action, payload)
  );

export const onDialog = (): void =>
  ipcMain.handle(
    INVOCATION.REMOTE.DIALOG,
    (event, action: ActionDialog, payload) => {
      switch (action) {
        case 'showOpenDialog':
          return dialog.showOpenDialog(payload);
        case 'showSaveDialog':
          return dialog.showSaveDialog(payload);
      }
    }
  );
