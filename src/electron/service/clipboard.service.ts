import { clipboard, nativeImage, NativeImage } from 'electron';
import { interval } from 'rxjs';
import { map, scan, filter } from 'rxjs/operators';
import { ClipDoc } from '../../rxdb/clips.models';

interface Clipboard {
  plainText: string;
  htmlText: string;
  richText: string;
  image: NativeImage;
  buffer: Buffer;
  formats: string[];
}

enum Types {
  PlainText = 'text/plain',
  HtmlText = 'text/html',
  Image = 'image/png',
}

const clipboardAsObservable = interval(1000).pipe(
  map(() => ({
    plainText: clipboard.readText(),
    htmlText: clipboard.readHTML(),
    richText: clipboard.readRTF(),
    image: clipboard.readImage(),
    formats: clipboard.availableFormats(),
  })),
  filter(({ formats }) => formats.length > 0),
  scan(
    (acc, current): { previous?: Clipboard; current: Clipboard } => ({
      previous: acc.current,
      current: { ...current, buffer: current.image.toBitmap() },
    }),
    {} as Partial<{ previous: Clipboard; current: Clipboard }>
  ),
  map(({ previous, current }): Omit<ClipDoc, 'id'> | undefined => {
    const isText = current ? !!current.formats.find((format) => format.includes('text')) : false;
    const isImage = current ? !!current.formats.find((format) => format.includes('image')) : false;
    const isBoth = isImage && isText;
    const imageEq = (current: Clipboard, previous: Clipboard) =>
      current.image.getBitmap().equals(previous.buffer);
    const textEq = (current: Clipboard, previous: Clipboard) =>
      current.plainText === previous.plainText;

    if (current) {
      const equals = previous
        ? isBoth
          ? imageEq(current, previous) && textEq(current, previous)
          : isImage
          ? imageEq(current, previous)
          : isText
          ? textEq(current, previous)
          : false
        : false;

      if (equals) {
        return;
      }

      return {
        plainText: current.plainText,
        htmlText: current.htmlText,
        richText: current.richText,
        dataURI: current.image.toDataURL(),
        category: 'none',
        type: isImage ? 'image' : 'text',
        formats: current.formats,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      };
    }
  }),
  filter((value) => !!value)
);

export const copyToClipboard = (type: 'text' | 'image', content: string) => {
  type === 'image'
    ? clipboard.writeImage(nativeImage.createFromDataURL(content))
    : clipboard.writeText(content);
};

export default {
  clipboardAsObservable,
  copyToClipboard,
};
