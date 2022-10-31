import fs from 'fs';
import path from 'path';

import { NativeImage, app, clipboard, nativeImage, protocol } from 'electron';
import { ObservableInput, interval, of } from 'rxjs';
import { concatMap, filter, map, scan } from 'rxjs/operators';
import { uuid } from 'uuidv4';

import { isSuccess, runCatching } from '@/utils/result';
import * as Sentry from '@/utils/sentry';

import { ClipDoc, Format } from '../../rxdb/clips/model';
interface Clipboard {
  plainText: string;
  htmlText: string;
  richText: string;
  image: NativeImage;
  buffer: Buffer;
  formats: string[];
}

export type Data = {
  text?: string;
  html?: string;
  image?: string;
  rtf?: string;
  /**
   * The title of the URL at `text`.
   */
  bookmark?: string;
};

const IMAGES_DIR = path.join(app.getPath('userData'), 'images');

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

export const copyToClipboard = (data: Data): void => {
  clipboard.write({ ...data, image: toNativeImage(data.image || '') });
};

export const removeImageDirectory = (): void =>
  fs.rmdirSync(IMAGES_DIR, { recursive: true });

export const removeFromDirectory = (content: string): void => {
  if (isImagePath(content)) fs.unlinkSync(toAbsolutePath(toImageName(content)));
};

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
  concatMap(
    ({
      previous,
      current,
    }): ObservableInput<Omit<ClipDoc, 'id'> | undefined> => {
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
      const equals = (current: Clipboard) =>
        previous
          ? isBoth
            ? imageEq(current, previous) && textEq(current, previous)
            : isImage
            ? imageEq(current, previous)
            : isText
            ? textEq(current, previous)
            : false
          : false;

      return current && !equals(current)
        ? runCatching(Sentry.captureException)(() => {
            const saveImage = () => {
              if (current.image.isEmpty()) return '';
              const dir = path.join(app.getPath('userData'), 'images');
              const imagePath = `${uuid()}.png`;
              if (!fs.existsSync(dir)) fs.mkdirSync(dir);
              fs.writeFileSync(
                path.join(dir, imagePath),
                current.image.toPNG()
              );
              return `image://${imagePath}`;
            };
            return {
              plainText: current.plainText,
              htmlText: current.htmlText,
              richText: current.richText,
              dataURI: saveImage(),
              category: 'none',
              type: isImage ? ('image' as const) : ('text' as const),
              formats: current.formats as Format[],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          })().then((response) =>
            isSuccess(response) ? response.data : undefined
          )
        : of(undefined);
    }
  ),
  filter((value) => !!value)
);

protocol.registerSchemesAsPrivileged([
  { scheme: 'image', privileges: { bypassCSP: true } },
]);

app.whenReady().then(() =>
  protocol.registerFileProtocol('image', (request, callback) => {
    const url = request.url.substr(8);
    callback({ path: path.join(IMAGES_DIR, url) });
  })
);
