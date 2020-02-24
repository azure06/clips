import { SettingsState, Clip, User } from './../../store/types';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import Store from 'electron-store';

const store = new Store();

const indexes = {
  appSettings: 'app-settings',
  credentials: 'credentials',
  pageToken: 'page-token',
  clips: 'clips',
  user: 'user',
};

function getUser(defaultValue?: User) {
  return store.get(indexes.user, defaultValue);
}

function getClips(defaultValue: Clip[] = []) {
  return store.get(indexes.clips, defaultValue);
}

function getPageToken(defaultValue?: string) {
  return store.get(indexes.pageToken, defaultValue);
}

function getCredentials(defaultValue?: Credentials) {
  return store.get(indexes.credentials, defaultValue);
}

function getAppSettings(defaultValue?: SettingsState) {
  return store.get(indexes.appSettings, defaultValue);
}

function setUser(value: User) {
  return store.set(indexes.user, value);
}

function setClips(value: Clip[]) {
  return store.set(indexes.clips, value);
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

interface AppStore {
  getUser(): User | undefined;
  getUser(defaultValue: User): User;
  getClips(defaultValue?: Clip[]): Clip[];
  getPageToken(): string | undefined;
  getPageToken(defaultValue: string): string;
  getCredentials(): Credentials | undefined;
  getCredentials(defaultValue: Credentials): Credentials;
  getAppSettings(): SettingsState | undefined;
  getAppSettings(defaultValue: SettingsState): SettingsState;
  setUser(defaultValue: User): void;
  setClips(value: Clip[]): void;
  setPageToken(value: string): void;
  setCredentials(value: Credentials): void;
  setAppSettings(value: SettingsState): void;
  removeUser(): void;
  removeClips(): void;
  removeCredentials(): void;
  clear(): void;
}

const appStore: AppStore = {
  getUser,
  getClips,
  getPageToken,
  getCredentials,
  getAppSettings,
  setUser,
  setClips,
  setPageToken,
  setCredentials,
  setAppSettings,
  removeUser,
  removeClips,
  removeCredentials,
  clear,
};

export default appStore;
