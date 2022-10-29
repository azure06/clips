import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';
import { ipcRenderer } from 'electron';

export const pageView = (
  path: string,
  hostname: string,
  title: string
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.ANALYTICS.PAGE_VIEW, path, hostname, title);
