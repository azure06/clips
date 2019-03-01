import { clipboard } from 'electron';
import { EventEmitter } from 'events';

enum Types {
  PlainText = 'text/plain',
  HtmlText = 'text/html',
  Image = 'image/png'
}

export default class ClipboardService extends EventEmitter {
  previousText: string;
  previousDataURI: string;

  constructor() {
    super();
    this.watchClipboard();
  }

  async watchClipboard() {
    const plainText = clipboard.readText();
    const htmlText = clipboard.readHTML();
    const image = clipboard.readImage();
    const formats = clipboard.availableFormats();

    if (formats.length > 0) {
      if (
        formats.find(format => format.includes('text')) &&
        plainText !== this.previousText
      ) {
        this.previousText = plainText;
        this.emit('clipboard-change', {
          id: undefined,
          plainText,
          htmlText,
          dataURI: undefined,
          formats,
          category: 'none',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      } else if (
        formats.find(format => format.includes('image')) &&
        image.toDataURL() !== this.previousDataURI
      ) {
        this.emit('clipboard-change', {
          id: undefined,
          plainText,
          htmlText,
          dataURI: image.toDataURL(),
          formats,
          category: 'none',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.watchClipboard();
  }
}
