import { SettingsState, Clip, User } from '../../store/types';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { uuid } from 'uuidv4';
import Store from 'electron-store';
import { isSpaceAvailable } from '@/utils';
import log from 'electron-log';

const store = new Store();

const indexes = {
  userId: 'app-user-id',
  appSettings: 'app-settings',
  credentials: 'credentials',
  pageToken: 'page-token',
  clips: 'clips',
  user: 'user',
  premium: 'premium',
};

function getUserId(): string {
  const userId: string = store.get(indexes.userId, uuid()) as string;
  store.set(indexes.userId, userId);
  return userId;
}

function getUser(): User | undefined;
function getUser(defaultValue: User): User;
function getUser(defaultValue?: User): User | undefined {
  return store.get(indexes.user, defaultValue) as User | undefined;
}

function getClips(defaultValue: Clip[] = []): Clip[] {
  return store.get(indexes.clips, defaultValue) as Clip[];
}

function getPageToken(): string | undefined;
function getPageToken(defaultValue: string): string;
function getPageToken(defaultValue?: string): string | undefined {
  return store.get(indexes.pageToken, defaultValue) as string | undefined;
}

function getCredentials(): Credentials | undefined;
function getCredentials(defaultValue: Credentials): Credentials;
function getCredentials(defaultValue?: Credentials): Credentials | undefined {
  return store.get(indexes.credentials, defaultValue) as Credentials;
}

function getAppSettings(): SettingsState | undefined;
function getAppSettings(defaultValue: SettingsState): SettingsState;
function getAppSettings(
  defaultValue?: SettingsState
): SettingsState | undefined {
  return store.get(indexes.appSettings, defaultValue) as SettingsState;
}

function getPremium(): boolean {
  return store.get(indexes.premium, false) as boolean;
}

function setUser(value: User): void {
  return store.set(indexes.user, value);
}

function setClips(value: Clip[]): void {
  // Check size of the file. Ignore action if soace
  if (isSpaceAvailable(value)) store.set(indexes.clips, value);
  else log.warn('File size exceeds the limit allowed and cannot be saved');
}

function setPageToken(value: string): void {
  return store.set(indexes.pageToken, value);
}

function setCredentials(value: Credentials): void {
  return store.set(indexes.credentials, value);
}

function setAppSettings(value: SettingsState): void {
  return store.set(indexes.appSettings, value);
}

function setPremium(value: boolean): void {
  return store.set(indexes.premium, value);
}

function removeUser(): void {
  return store.delete(indexes.user);
}

function removeClips(): void {
  return store.delete(indexes.clips);
}

function removeCredentials(): void {
  return store.delete(indexes.credentials);
}

function clear(): void {
  store.clear();
}

export const storeService = {
  getUserId,
  getUser,
  getClips,
  getPageToken,
  getCredentials,
  getAppSettings,
  getPremium,
  setUser,
  setClips,
  setPageToken,
  setCredentials,
  setAppSettings,
  setPremium,
  removeUser,
  removeClips,
  removeCredentials,
  clear,
};
