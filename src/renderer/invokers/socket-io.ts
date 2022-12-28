import { ipcRenderer } from 'electron';
import { IDevice } from 'local-devices';
import { MessageDoc } from '@/rxdb/message/model';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

/**  Socket io */
export const handleIoServer = (
  action: 'start' | 'close'
): Promise<Result__<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.HANDLE_SERVER, action);

export const getMyDevice = (): Promise<Result__<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.MY_DEVICE);

export const sendFile = (
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.SEND_FILE, sender, receiver, message);
