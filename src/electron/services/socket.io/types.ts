import { MessageDoc } from '@/rxdb/message/model';
import findLocalDevices from 'local-devices';
import { Progress } from 'progress-stream';

export type IDevice = findLocalDevices.IDevice & {
  username: string;
  port: number;
};

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

export type MessageReq = MessageDoc | State;

export function isMessageText(args: MessageReq): args is MessageDoc {
  return 'type' in args && args.type === 'text';
}
