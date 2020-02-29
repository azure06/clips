import electron, { Rectangle } from 'electron';
import { Subject, merge, timer } from 'rxjs';
import { ClipDoc } from '@/rxdb/clips.models';
import { debounce, map } from 'rxjs/operators';

const mainWindow = electron.remote.getCurrentWindow();
const resizeSubject = new Subject<any>();
const moveSubject = new Subject<any>();
const clipSubject = new Subject<ClipDoc>();
const navigateSubject = new Subject<{ name: string }>();

mainWindow.on('resize', (args: any) => resizeSubject.next(args));
mainWindow.on('move', (args: any) => resizeSubject.next(args));
electron.ipcRenderer.on('navigate', (event, args: { name: string }) => navigateSubject.next(args));
electron.ipcRenderer.on('clipboard-change', (event, data) => clipSubject.next(data));

const onBoundsChange = merge(moveSubject.asObservable(), resizeSubject.asObservable())
  .pipe(debounce(() => timer(1000)))
  .pipe(map((args) => args.sender.getBounds() as Rectangle));

export default {
  clipboardChange: clipSubject.asObservable(),
  onNavigate: navigateSubject.asObservable(),
  onBoundsChange,
};
