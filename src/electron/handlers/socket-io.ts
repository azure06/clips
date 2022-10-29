// SocketIO

import { MessageDoc } from '@/rxdb/message/model';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';
import { ipcMain } from 'electron';
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
    message: MessageDoc
  ) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.SEND_FILE, (event, sender, receiver, message) =>
    func(sender, receiver, message)
  );
