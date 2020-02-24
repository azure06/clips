import electron, { Rectangle } from 'electron';
import { Subject, merge, timer } from 'rxjs';
import { ClipDoc } from '@/rxdb/clips.models';
import elctron from 'electron';
import { debounce, map } from 'rxjs/operators';

const mainWindow = electron.remote.getCurrentWindow();
const resizeSubject = new Subject<any>();
const moveSubject = new Subject<any>();
const clipSubject = new Subject<ClipDoc>();

mainWindow.on('resize', (args: any) => resizeSubject.next(args));
mainWindow.on('move', (args: any) => resizeSubject.next(args));
electron.ipcRenderer.on('clipboard-change', (event, data) => clipSubject.next(data));

const onBoundsChange = merge(moveSubject.asObservable(), resizeSubject.asObservable())
  .pipe(debounce(() => timer(1000)))
  .pipe(map((args) => args.sender.getBounds() as Rectangle));

export default {
  clipboardChange: clipSubject.asObservable(),
  onBoundsChange,
};
