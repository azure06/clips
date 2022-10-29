// SignIn

import { INVOCATION } from '@/utils/constants';
import { HttpResult__ } from '@/utils/result';
import { ipcMain } from 'electron';
import { drive_v3 } from 'googleapis';

export const onSignIn = (
  func: () => Promise<HttpResult__<drive_v3.Schema$About>>
): void => ipcMain.handle(INVOCATION.SIGN_IN, func);

export const onSignOut = (
  func: () => Promise<HttpResult__<{ success: boolean }>>
): void => ipcMain.handle(INVOCATION.SIGN_OUT, func);
