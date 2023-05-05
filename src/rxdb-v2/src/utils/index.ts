// const removeDir = async (db: 'leveldown' | 'IndexedDB') => {
//   const { fs, path } = await import('@/helpers/node');
//   const dir = path.join(app.getPath('userData'), db);
//   if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
// };
// [DBType, plugin, adapter, path]
export type RxDBAdapter =
  | ['idb', unknown, 'idb', 'clips']
  | ['leveldb', unknown, unknown, string];

export const getRxDBAdapter = async ([env, p]:
  | ['browser']
  | ['node', string]): Promise<RxDBAdapter> => {
  switch (env) {
    case 'browser': {
      const adapter = (await import('pouchdb-adapter-idb')).default;
      return ['idb', adapter, 'idb', 'clips'];
    }
    case 'node': {
      const fs = (await import('fs')).default;
      const path = (await import('path')).default;
      const leveldown = (await import('leveldown')).default;
      const adapter = (await import('pouchdb-adapter-leveldb')).default;
      const getLeveldownPath = (userDataPath: string) => {
        const dir = path.join(userDataPath, 'leveldown');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        return `${dir}/leveldown`;
      };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return ['leveldb', adapter, leveldown, getLeveldownPath(p!)];
    }
  }
};

export {
  patterns as clipsPattern,
  query as clipsQuery,
} from '../internal/clips/utils';

export {
  parseContent as parseMessageContent,
  stringifyContent as stringifyMessageContent,
  defaultContent as defaultMessageContent,
} from '../internal/message/model';
