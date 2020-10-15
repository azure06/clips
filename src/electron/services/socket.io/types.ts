type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Start {
  fileName: string;
  status: 'start';
}

export type Keep = Omit<Start, 'status'> & { status: 'keep'; buffer: Buffer };

export type End = Omit<Start, 'status'> & { status: 'end' };

export type ConnectionState = Start | Keep | End;
