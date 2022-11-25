import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { app, nativeImage } from 'electron';
import { Format } from '@/renderer/invokers/configuration';
import { Result__, toFailure, toSuccess } from '@/utils/result';

const CLIPS_DIRECTORY = path.join(`${app.getPath('documents')}`, 'clips');

function whenJSON<T>(
  f1: (data: string) => T,
  f2: (data: string) => T,
  data: string
) {
  try {
    return f1(JSON.parse(data));
  } catch (e) {
    return f2(data);
  }
}
function createFile(format: Format, data: string) {
  const ext = (() => {
    switch (format) {
      case 'plain/text':
        //prettier-ignore
        return whenJSON(() => `json`,() => `txt`,data);
      case 'image/png':
        return 'png';
      case 'text/html':
        return 'html';
      case 'text/rtf':
        return 'rtf';
    }
  })();
  const getFilePath = (index = 1): string => {
    const filePath = path.join(CLIPS_DIRECTORY, `Untitled-${index}.${ext}`);
    return fs.existsSync(filePath) ? getFilePath(index + 1) : filePath;
  };
  const filePath = getFilePath();
  if (!fs.existsSync(CLIPS_DIRECTORY)) fs.mkdirSync(CLIPS_DIRECTORY);
  fs.writeFileSync(
    filePath,
    format === 'image/png' ? nativeImage.createFromDataURL(data).toPNG() : data
  );
  return filePath;
}

function executeCommand(...args: string[]): Promise<Result__<string>> {
  return new Promise<Result__<string>>((resolve, reject) =>
    exec(`${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) reject(toFailure(stderr));
      if (stderr) reject(toFailure(stderr));
      resolve(toSuccess(stdout ?? 'empty::response'));
    })
  );
}

export function withCommand(
  conf: { format: Format; command: string; args: 'file-location' | 'value' },
  data: string
): Promise<Result__<string>> {
  return Promise.resolve(data).then((data) => {
    switch (conf.args) {
      case 'value': {
        return executeCommand(conf.command, data);
      }
      case 'file-location': {
        const filePath = createFile(conf.format, data);
        return executeCommand(conf.command, filePath);
      }
    }
  });
}
