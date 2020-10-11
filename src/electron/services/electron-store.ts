import { SettingsState, Clip, User } from '../../store/types';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { uuid } from 'uuidv4';
import Store from 'electron-store';
import { isSpaceAvailable } from '@/utils/clipsize';
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

function getUserId() {
  const userId: string = store.get(indexes.userId, uuid()) as string;
  store.set(indexes.userId, userId);
  return userId;
}

function getUser(): User | undefined;
function getUser(defaultValue: User): User;
function getUser(defaultValue?: User) {
  return store.get(indexes.user, defaultValue) as User | undefined;
}

function getClips(defaultValue: Clip[] = []) {
  return store.get(indexes.clips, defaultValue) as Clip[];
}

function getPageToken(): string | undefined;
function getPageToken(defaultValue: string): string;
function getPageToken(defaultValue?: string) {
  return store.get(indexes.pageToken, defaultValue) as string | undefined;
}

function getCredentials(): Credentials | undefined;
function getCredentials(defaultValue: Credentials): Credentials;
function getCredentials(defaultValue?: Credentials) {
  return store.get(indexes.credentials, defaultValue);
}

function getAppSettings(): SettingsState | undefined;
function getAppSettings(defaultValue: SettingsState): SettingsState;
function getAppSettings(defaultValue?: SettingsState) {
  return store.get(indexes.appSettings, defaultValue);
}

function getPremium() {
  return store.get(indexes.premium, false) as boolean;
}

function setUser(value: User) {
  return store.set(indexes.user, value);
}

function setClips(value: Clip[]) {
  // Check size of the file. Ignore action if soace
  if (isSpaceAvailable(value)) store.set(indexes.clips, value);
  else log.warn('File size exceeds the limit allowed and cannot be saved');
}

function setPageToken(value: string) {
  return store.set(indexes.pageToken, value);
}

function setCredentials(value: Credentials) {
  return store.set(indexes.credentials, value);
}

function setAppSettings(value: SettingsState) {
  return store.set(indexes.appSettings, value);
}

function setPremium(value: Boolean) {
  return store.set(indexes.premium, value);
}

function removeUser() {
  return store.delete(indexes.user);
}

function removeClips() {
  return store.delete(indexes.clips);
}

function removeCredentials() {
  return store.delete(indexes.credentials);
}

function clear() {
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
