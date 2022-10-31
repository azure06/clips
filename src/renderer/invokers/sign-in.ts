import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import { INVOCATION } from '@/utils/constants';
import { HttpResult__ } from '@/utils/result';

export const signIn = (): Promise<HttpResult__<drive_v3.Schema$About>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_IN);

export const signOut = (): Promise<HttpResult__<{ success: boolean }>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_OUT);
