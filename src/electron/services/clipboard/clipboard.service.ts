import { clipboard } from 'electron';
import { EventEmitter } from 'events';

enum Types {
  PlainText = 'text/plain',
  HtmlText = 'text/html',
  Image = 'image/png'
}

export default class ClipboardService extends EventEmitter {
  private previousText: string;
  private previousFile?: Buffer;

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
        !formats.find(format => format.includes('image')) &&
        plainText.trim() !== '' &&
        plainText !== this.previousText
      ) {
        this.previousText = plainText;
        this.emit('clipboard-change', {
          plainText,
          htmlText,
          category: 'none',
          formats,
          type: 'text',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      } else if (
        formats.find(format => format.includes('image')) &&
        !image.getBitmap().equals(this.previousFile || new Uint8Array())
      ) {
        this.previousFile = image.toBitmap();
        this.emit('clipboard-change', {
          plainText:
            plainText || image.toDataURL({ scaleFactor: 0.2 }).slice(-25),
          htmlText,
          dataURI: image.toDataURL(),
          category: 'none',
          formats,
          type: 'image',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.watchClipboard();
  }
}
