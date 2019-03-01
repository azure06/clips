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
    const availableFormats = clipboard.availableFormats();

    if (availableFormats.length > 0) {
      const isText = availableFormats.includes(Types.PlainText);
      if (isText && plainText && plainText !== this.previousText) {
        this.previousText = plainText;
        this.emit('clipboard-change', {
          id: undefined,
          plainText,
          htmlText,
          dataURI: undefined,
          formats: availableFormats,
          category: 'none',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      } else if (this.previousDataURI === image.toDataURL()) {
        this.emit('clipboard-change', {
          id: undefined,
          plainText,
          htmlText,
          dataURI: image.toDataURL(),
          formats: availableFormats,
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
