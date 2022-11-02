import Store from 'electron-store';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { uuid } from 'uuidv4';

import { AppConfState, Clip } from '../../renderer/store/types';

const store = new Store<
  AppConfState & { credentials: Credentials | undefined }
>();

const indexes = {
  userId: 'app-user-id' as const,
  configuration: 'app-conf' as const,
  credentials: 'credentials' as const,
  pageToken: 'page-token' as const,
  clips: 'clips' as const,
};

export function watchRxDBAdapter(
  func: (arg: 'auto' | 'idb' | 'leveldb') => void
): ReturnType<typeof store.onDidChange> {
  return store.onDidChange(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'app-conf.advanced.rxdbAdapter' as any,
    (newValue) => func(newValue)
  );
}

export function getUserId(): string {
  const userId: string = store.get(indexes.userId, uuid()) as string;
  store.set(indexes.userId, userId);
  return userId;
}

/** Configuration */

export function getAppConf(): AppConfState | undefined;
export function getAppConf(defaultValue: AppConfState): AppConfState;
export function getAppConf(
  defaultValue?: AppConfState
): AppConfState | undefined {
  return store.get(indexes.configuration, defaultValue);
}

/** Clips for Google Drive */

export function getClips(defaultValue: Clip[] = []): Clip[] {
  return localStorage
    ? (() => {
        const clips = localStorage.getItem(indexes.clips);
        return clips ? JSON.parse(clips) : defaultValue;
      })()
    : defaultValue;
}

/** Google Drive */

export function getPageToken(): string | undefined;
export function getPageToken(defaultValue: string): string;
export function getPageToken(defaultValue?: string): string | undefined {
  return store.get(indexes.pageToken, defaultValue) as string | undefined;
}

/** Auth Credentials */

export function getCredentials(): Credentials | undefined;
export function getCredentials(defaultValue: Credentials): Credentials;
export function getCredentials(
  defaultValue?: Credentials
): Credentials | undefined {
  return store.get(indexes.credentials, defaultValue);
}

export function setClips(value: Clip[]): void {
  if (localStorage) localStorage.setItem(indexes.clips, JSON.stringify(value));
}

export function setPageToken(value: string): void {
  return store.set(indexes.pageToken, value);
}

export function setCredentials(value: Credentials): void {
  return store.set(indexes.credentials, value);
}

export function setAppConf(value: AppConfState): void {
  return store.set(indexes.configuration, value);
}

export function removeClips(): void {
  if (localStorage) localStorage.removeItem(indexes.clips);
}

export function removeCredentials(): void {
  return store.delete(indexes.credentials);
}

export function clear(): void {
  store.clear();
}
