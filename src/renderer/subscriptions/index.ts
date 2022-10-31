import electron, { Rectangle } from 'electron';
import { Subject, merge, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';

import { IDevice, Progress } from '@/electron/services/socket.io/types';
import { ClipDoc } from '@/rxdb/clips/model';
import { MessageDoc } from '@/rxdb/message/model';

const resizeSubject = new Subject<unknown>();
const moveSubject = new Subject<unknown>();
const clipSubject = new Subject<ClipDoc>();
const navigateSubject = new Subject<{ name: string }>();
const messageSubject = new Subject<{
  sender: IDevice;
  message: MessageDoc;
}>();
const authorizeSubject = new Subject<IDevice>();
const statusSubject = new Subject<
  | {
      status: 'next';
      receiverId: string;
      messageId: string;
      progress: Progress;
    }
  | {
      status: 'complete' | 'error';
      receiverId: string;
      messageId: string;
    }
>();
const transactionsSubject = new Subject<Electron.Transaction[]>();

electron.ipcRenderer.on('resize', (args: unknown) => resizeSubject.next(args));
electron.ipcRenderer.on('move', (args: unknown) => resizeSubject.next(args));
electron.ipcRenderer.on('navigate', (event, args: { name: string }) =>
  navigateSubject.next(args)
);
electron.ipcRenderer.on('clipboard-change', (event, data) =>
  clipSubject.next(data)
);
electron.ipcRenderer.on('message', (event, data) => messageSubject.next(data));
electron.ipcRenderer.on('authorize', (event, data) =>
  authorizeSubject.next(data)
);
electron.ipcRenderer.on(
  'progress-status',
  (event, status, receiverId, messageId, progress) =>
    statusSubject.next({ status, receiverId, messageId, progress })
);
electron.ipcRenderer.on('transactions-updated', (event, transactions) =>
  transactionsSubject.next(transactions)
);

export const clipboardChange = clipSubject.asObservable();
export const onNavigate = navigateSubject.asObservable();
export const onMessage = messageSubject.asObservable();
export const onAuthorize = authorizeSubject.asObservable();
export const onProgress = statusSubject.asObservable();
export const onTransactionsUpdated = transactionsSubject.asObservable();
export const onBoundsChange = merge(
  moveSubject.asObservable(),
  resizeSubject.asObservable()
)
  .pipe(debounce(() => timer(1000)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .pipe(map((args) => (args as any).sender.getBounds() as Rectangle));
