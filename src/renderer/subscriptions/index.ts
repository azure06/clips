import electron, { Rectangle } from 'electron';
import { BehaviorSubject, Subject, merge, timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { IDevice, Progress } from '@/electron/services/socket.io/types';
import { Message, Clip } from '@/rxdb-v2/src/types';

const resizeSubject = new Subject<Rectangle>();
const moveSubject = new Subject<Rectangle>();
const clipSubject = new Subject<Clip>();
const navigateSubject = new Subject<{ name: string }>();
const messageSubject = new Subject<{
  sender: IDevice;
  message: Message;
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
const ratioChangeSubject = new BehaviorSubject<
  ['idle'] | ['running', number, number]
>(['idle']);

electron.ipcRenderer.on('resize', (event, args: Rectangle) =>
  resizeSubject.next(args)
);
electron.ipcRenderer.on('move', (event, args: Rectangle) =>
  resizeSubject.next(args)
);
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
electron.ipcRenderer.on('search-ratio-change', (event, ratio) =>
  ratioChangeSubject.next(ratio)
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
).pipe(debounce(() => timer(1000)));
export const onSearchRatioChange = ratioChangeSubject
  .asObservable()
  .pipe(tap((value) => console.log('search rate', value)));
