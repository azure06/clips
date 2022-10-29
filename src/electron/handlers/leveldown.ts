import { INVOCATION } from '@/utils/constants';
import { Methods, MethodsReturnType } from '@/utils/methods';
import { ipcMain } from 'electron';

// Node DB
export const onNodeDB = (
  func: <P extends never[]>(methodNm: Methods, args: P) => MethodsReturnType
): void =>
  ipcMain.handle(INVOCATION.NODE_DB, (_, methodNm, args) =>
    func(methodNm, args)
  );
