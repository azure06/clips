import fs_ from 'fs';
import path_ from 'path';

import leveldown_ from 'leveldown';
import pouchAdapter_ from 'pouchdb-adapter-leveldb';

export const fs = fs_;
export const path = path_;
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const pouchAdapter = pouchAdapter_;
export const leveldown = leveldown_;
