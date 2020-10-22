import findLocalDevices from 'local-devices';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IDevice = findLocalDevices.IDevice & {
  username: string;
  port: number;
};

export interface Start {
  fileName: string;
  status: 'start';
}

export type Keep = Omit<Start, 'status'> & { status: 'keep'; buffer: Buffer };

export type End = Omit<Start, 'status'> & { status: 'end' };

export type State = Start | Keep | End;
