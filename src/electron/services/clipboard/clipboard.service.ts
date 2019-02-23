import { clipboard } from 'electron';
import { EventEmitter } from 'events';

enum Types {
  PlainText = 'text/plain',
  HtmlText = 'text/html',
  Image = 'image/png'
}

export default class ClipboardService extends EventEmitter {
  previousText: string;

  constructor() {
    super();
    this.watchClipboard();
  }

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
        this.emit('clipboard-change', {
          id: undefined,
          plainText,
          htmlText,
          dataURI: '',
          types: availableFormats,
          createdAt: new Date(),
          updatedAt: new Date()
        });
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
