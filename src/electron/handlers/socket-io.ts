// SocketIO

import { ipcMain } from 'electron';

import { Message } from '@/rxdb-v2/src/types';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

import { IDevice } from '../services/socket.io/types';

export const onMyDevice = (func: () => Promise<Result__<IDevice>>): void =>
  ipcMain.handle(INVOCATION.MY_DEVICE, () => func());

export const onHandleServer = (
  func: (action: 'start' | 'close') => Promise<Result__<IDevice>>
): void =>
  ipcMain.handle(INVOCATION.HANDLE_SERVER, (event, action) => func(action));

export const onSendFile = (
  func: (
    sender: IDevice,
    receiver: IDevice,
    message: Message
  ) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.SEND_FILE, (event, sender, receiver, message) =>
    func(sender, receiver, message)
  );
