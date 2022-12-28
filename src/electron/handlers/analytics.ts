import { ipcMain } from 'electron';

import { INVOCATION } from '@/utils/constants';

export const onPageView = (
  func: (path: string, hostname: string, title: string) => void
): void =>
  ipcMain.handle(
    INVOCATION.ANALYTICS.PAGE_VIEW,
    (event, path: string, hostname: string, title: string) =>
      func(path, hostname, title)
  );
