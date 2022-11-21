import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { app, nativeImage } from 'electron';
import { Format } from '@/renderer/invokers/configuration';

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

export function openWithEditor(
  conf: { args: string; format: Format },
  data: string
): Promise<string> {
  return Promise.resolve(data).then((data) => {
    const ext = (() => {
      switch (conf.format) {
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
      conf.format === 'image/png'
        ? nativeImage.createFromDataURL(data).toPNG()
        : data
    );
    return new Promise((resolve, reject) =>
      exec(`${conf.args} ${filePath}`, (error, stdout, stderr) => {
        if (error) reject(`error: ${stderr}`);
        if (stderr) reject(`stderr: ${stderr}`);
        resolve(stdout);
      })
    );
  });
}
