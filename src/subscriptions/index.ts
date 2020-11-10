import electron, { Rectangle } from 'electron';
import { Subject, merge, timer } from 'rxjs';
import { ClipDoc } from '@/rxdb/clips/model';
import { debounce, map } from 'rxjs/operators';
import { MessageDoc } from '@/rxdb/message/model';
import { IDevice } from '@/electron/services/socket.io/types';
import { Progress } from 'progress-stream';

const mainWindow = electron.remote.getCurrentWindow();
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

mainWindow.on('resize', (args: unknown) => resizeSubject.next(args));
mainWindow.on('move', (args: unknown) => resizeSubject.next(args));
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
  'status',
  (event, status, receiverId, messageId, progress) =>
    statusSubject.next({ status, receiverId, messageId, progress })
);

export const clipboardChange = clipSubject.asObservable();
export const onNavigate = navigateSubject.asObservable();
export const onMessage = messageSubject.asObservable();
export const onAuthorize = authorizeSubject.asObservable();
export const onProgress = statusSubject.asObservable();
export const onBoundsChange = merge(
  moveSubject.asObservable(),
  resizeSubject.asObservable()
)
  .pipe(debounce(() => timer(1000)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .pipe(map((args) => (args as any).sender.getBounds() as Rectangle));
