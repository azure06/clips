import findLocalDevices from 'local-devices';

import { messageModel } from '@/rxdb-v2/dist/src';

export type IDevice = findLocalDevices.IDevice & {
  username: string;
  port: number;
};

export interface Progress {
  percentage: number;
  transferred: number;
  length: number;
  remaining: number;
  eta: number;
  runtime: number;
  speed: number;
}

export interface Start {
  filename: string;
  status: 'start';
  progress: Progress;
}

export type Keep = Omit<Start, 'status'> & {
  status: 'keep';
  buffer: Buffer;
};

export type End = Omit<Start, 'status'> & { status: 'end' };

export type Error = Omit<Start, 'status' | 'progress'> & { status: 'error' };

export type State = Start | Keep | End | Error;

export type StateOmitP =
  | Omit<Start, 'progress'>
  | Omit<Keep, 'progress'>
  | Omit<End, 'progress'>
  | Error;

export type MessageReq = messageModel.MessageDoc | State;

export function isMessageText(
  args: MessageReq
): args is messageModel.MessageDoc {
  return 'type' in args && args.type === 'text';
}
