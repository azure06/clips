import electron, { Rectangle } from 'electron';
import { Subject, merge, timer } from 'rxjs';
import { ClipDoc } from '@/rxdb/clips/model';
import { debounce, map } from 'rxjs/operators';
import { MessageDoc } from '@/rxdb/message/model';
import { IDevice } from '@/electron/services/socket.io/types';

const mainWindow = electron.remote.getCurrentWindow();
const resizeSubject = new Subject<any>();
const moveSubject = new Subject<any>();
const clipSubject = new Subject<ClipDoc>();
const navigateSubject = new Subject<{ name: string }>();
const messageSubject = new Subject<{ sender: IDevice; message: MessageDoc }>();
const authorizeSubject = new Subject<IDevice>();

mainWindow.on('resize', (args: any) => resizeSubject.next(args));
mainWindow.on('move', (args: any) => resizeSubject.next(args));
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

export const clipboardChange = clipSubject.asObservable();
export const onNavigate = navigateSubject.asObservable();
export const onMessage = messageSubject.asObservable();
export const onAuthorize = authorizeSubject.asObservable();
export const onBoundsChange = merge(
  moveSubject.asObservable(),
  resizeSubject.asObservable()
)
  .pipe(debounce(() => timer(1000)))
  .pipe(map((args) => args.sender.getBounds() as Rectangle));
