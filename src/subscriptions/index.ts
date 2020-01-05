import electron from 'electron';
import { Subject } from 'rxjs';
import { ClipDoc } from '@/rxdb/clips.models';

const clipSubject = new Subject<ClipDoc>();
electron.ipcRenderer.on('clipboard-change', (event, data) => clipSubject.next(data));

export default {
  clipboardChange: clipSubject.asObservable(),
};
