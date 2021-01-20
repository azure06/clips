import { ClipDoc, Format } from '../../rxdb/clips/model';
import { app, clipboard, nativeImage, NativeImage, protocol } from 'electron';
import { interval, of } from 'rxjs';
import { map, scan, filter, catchError } from 'rxjs/operators';
import path from 'path';
import fs from 'fs';
import { uuid } from 'uuidv4';
import log from 'electron-log';
interface Clipboard {
  plainText: string;
  htmlText: string;
  richText: string;
  image: NativeImage;
  buffer: Buffer;
  formats: string[];
}

const IMAGES_DIR = path.join(app.getPath('userData'), 'images');
const SKIP_PATTERN = '\t\t\t\t';

const catching = <T>(func: (...args: unknown[]) => T) => {
  try {
    return func();
  } catch (e) {
    // file doesn't exist, no permissions, etc..
    // full list of possible errors is here
    // http://man7.org/linux/man-pages/man2/unlink.2.html#ERRORS
    log.error(e);
  }
};

const isImagePath = (content: string): boolean => {
  return content.startsWith('image://');
};

const toImageName = (content: string): string => {
  return content.substr(7);
};

const toAbsolutePath = (imageNm: string): string =>
  path.join(IMAGES_DIR, imageNm);

const toNativeImage = (content: string): NativeImage => {
  return isImagePath(content)
    ? nativeImage.createFromPath(toAbsolutePath(toImageName(content)))
    : nativeImage.createFromDataURL(content);
};

export const convertToDataURI = (content: string): string => {
  return toNativeImage(content).toDataURL();
};

export const copyToClipboard = (
  type: 'text' | 'image',
  content: string
): void => {
  type === 'image'
    ? clipboard.write({ text: SKIP_PATTERN, image: toNativeImage(content) })
    : clipboard.writeText(content);
};

export const removeImageDirectory = (): void =>
  catching(() => fs.rmdirSync(IMAGES_DIR, { recursive: true }));

export const removeFromDirectory = (content: string): void =>
  catching(() => fs.unlinkSync(toAbsolutePath(toImageName(content))));

export const clipboardAsObservable = interval(1000).pipe(
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
    const isText = current
      ? !!current.formats.find((format) => format.includes('text'))
      : false;
    const isImage = current
      ? !!current.formats.find((format) => format.includes('image'))
      : false;
    const isBoth = isImage && isText;
    const imageEq = (current: Clipboard, previous: Clipboard) =>
      current.image.getBitmap().equals(previous.buffer);
    const textEq = (current: Clipboard, previous: Clipboard) =>
      current.plainText === previous.plainText;
    const skipCopyPattern = (current: Clipboard) =>
      current.plainText === SKIP_PATTERN;

    if (current) {
      const equals = previous
        ? isBoth
          ? (imageEq(current, previous) && textEq(current, previous)) ||
            skipCopyPattern(current)
          : isImage
          ? imageEq(current, previous)
          : isText
          ? textEq(current, previous)
          : false
        : false;

      if (equals) {
        return;
      }

      const saveImage = () => {
        if (current.image.isEmpty()) return '';
        const dir = path.join(app.getPath('userData'), 'images');
        const imageNm = `${uuid()}.png`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir, imageNm), current.image.toPNG());
        return `image://${imageNm}`;
      };

      return {
        plainText: current.plainText,
        htmlText: current.htmlText,
        richText: current.richText,
        dataURI: saveImage(),
        category: 'none',
        type: isImage ? 'image' : 'text',
        formats: current.formats as Format[],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
  }),
  catchError((err) => of(log.error(err))),
  filter((value) => !!value)
);

protocol.registerSchemesAsPrivileged([
  { scheme: 'image', privileges: { bypassCSP: true } },
]);

app.whenReady().then(() =>
  protocol.registerFileProtocol(
    'image',
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.join(IMAGES_DIR, url) });
    },
    (error) => {
      if (error) console.error('Failed to register protocol');
    }
  )
);
