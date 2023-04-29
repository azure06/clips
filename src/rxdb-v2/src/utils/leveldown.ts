import fs from 'fs';
import path from 'path';

import leveldown_ from 'leveldown';
import adapter_ from 'pouchdb-adapter-leveldb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const adapter = adapter_;
export const leveldown: unknown = leveldown_;

export const getLeveldownPath = async (userDataPath: string) => {
  const dir = path.join(userDataPath, 'leveldown');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return `${dir}/leveldown`;
};

// const removeDir = async (db: 'leveldown' | 'IndexedDB') => {
//   const { fs, path } = await import('@/helpers/node');
//   const dir = path.join(app.getPath('userData'), db);
//   if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
// };
