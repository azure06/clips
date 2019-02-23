import { clipboard } from 'electron';
import Store from 'electron-store';
import { EventEmitter } from 'events';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';

enum Types {
  PlainText = 'text/plain',
  HtmlText = 'text/html',
  Image = 'image/png'
}

interface Base {
  id: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Clip extends Base {
  plainText?: string;
  htmlText?: string;
  dataUri?: any;
  types: string[];
}

export default class ClipboardService extends EventEmitter {
  store = new Store();
  clips: Clip[] = [];
  previousText: string;

  constructor() {
    super();
    this.initClipboard();
    this.watchClipboard();
    this.emit('clipboard-change', this.clips);
  }

  get clipsObj() {
    return this.clips.reduce(
      (accumulator: { [key: string]: Clip }, currentValue) => {
        accumulator[currentValue.id] = currentValue;
        return accumulator;
      },
      {}
    );
  }

  initClipboard(): void {
    this.clips = this.store.get('clips') || [];
  }

  addToStore(clip: Clip): void {
    const filteredClips = this.clips.filter(
      filterngClip => filterngClip.plainText !== clip.plainText
    );

    this.clips = [clip, ...filteredClips];
    this.store.set('clips', this.clips);
  }

  updateStore(clip: Clip[]): void {}

  removeFromStore(): void {}

  // escapeCharacters(unsageStr) {
  //   return unsageStr
  //     .replace(/&/g, '&amp;')
  //     .replace(/</g, '&lt;')
  //     .replace(/>/g, '&gt;')
  //     .replace(/"/g, '&quot;')
  //     .replace(/'/g, '&#039;');
  // }

  async watchClipboard() {
    const plainText = clipboard.readText();
    const htmlText = clipboard.readHTML();
    const image = clipboard.readImage();
    const availableFormats = clipboard.availableFormats();

    if (availableFormats.length > 0) {
      const isText = availableFormats.includes(Types.PlainText);
      if (isText && plainText && plainText !== this.previousText) {
        this.previousText = plainText;
        this.addToStore({
          id: uuidv4(),
          plainText,
          htmlText,
          types: availableFormats,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        this.emit('clipboard-change', this.clips);
      } else if (!isText) {
        // this.emit('clipboard-change', {
        //   image,
        //   availableFormats
        // });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.watchClipboard();
  }
}
