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

  escapeCharacters(unsageStr) {
    return unsageStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async watchClipboard() {
    const clipboardText = clipboard.readText();
    const clipboardHtml = clipboard.readHTML();
    const clipboardImage = clipboard.readImage();
    const availableFormats = clipboard.availableFormats();

    if (availableFormats.length > 0) {
      const isPlainText = availableFormats.includes(Types.PlainText);
      const isHtmlText = availableFormats.includes(Types.HtmlText);
      if (isPlainText && clipboardText && clipboardText !== this.previousText) {
        this.previousText = clipboardText;
        this.emit(
          'clipboard-change',
          isHtmlText ? { clipboardHtml } : { clipboardText }
        );
      } else if (!isPlainText) {
        this.emit('clipboard-change', {
          clipboardImage,
          availableFormats
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.watchClipboard();
  }
}
