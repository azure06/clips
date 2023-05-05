import { Clip, User, Room, Message } from '@/rxdb-v2/src/types';

/** Network Types */
export type RoomExt = Room & { messages: Message[] };

export type LoDevices = boolean;
export type LoRooms = boolean;
export type LoMessages = boolean;

export type Loading = [LoDevices, LoRooms, LoMessages];

export interface NetworkState {
  status: 'started' | 'closed'; // Server status
  thisUser?: User;
  users: User[];
  rooms: RoomExt[];
  loading: Loading;
}

/** Configuration Types */

type MacOSFuzzy = ['⌘', 'shift', string];
type WindowsOSFuzzy = ['ctrl', 'alt', string];
export type InAppStatus =
  | 'none'
  | 'pre-purchasing'
  | 'purchasing'
  | 'purchased'
  | 'failed'
  | 'restored'
  | 'deferred';

interface CursorMode {
  type: 'cursor';
  height: number;
  width: number;
}

interface MaintainMode {
  type: 'maintain';
  position: { x: number; y: number };
  height: number;
  width: number;
}

export interface GoogleUser {
  displayName: string;
  emailAddress: string;
  kind: string;
  me: true;
  permissionId: string;
  photoLink: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface General {
  notifications: boolean;
  startup: boolean;
  blur: boolean;
  alwaysOnTop: boolean;
  skipTaskbar: boolean; // only for windows
  positioningMode: MaintainMode | CursorMode;
}

export interface Advanced {
  // Search Mode
  searchMode: 'accurate' | 'fuzzy' | 'advanced-fuzzy';
  rxdbAdapter: 'auto' | 'idb' | 'leveldb';
  // Saving Formats
  formats: {
    plainText: boolean;
    richText: boolean;
    htmlText: boolean;
    dataURI: boolean;
  };
  //
  commands: Array<
    [
      'none' | 'copy-event',
      string,
      'file-location' | 'value',
      'all' | 'text' | 'json' | 'html' | 'rtf' | 'picture',
      'none' | 'new-entry' | 'replace-entry' | 'popup'
    ]
  >;
  // Optimization
  optimize: number;
  // System
  shortcut: MacOSFuzzy | WindowsOSFuzzy;
  language:
    | 'Auto'
    | 'English'
    | 'Italiano'
    | '日本語'
    | '简体中文'
    | '繁體中文';
}

export interface Appearance {
  theme: 'auto' | 'dark' | 'light';
}

export interface Drive {
  sync: boolean;
  syncThreshold: number;
  backup: boolean;
  backupThreshold: number;
  syncedFiles: { [id: string]: boolean };
}

export interface Development {
  analytics: boolean;
}

export interface AppConfState {
  user: GoogleUser | null;
  labels: Label[];
  general: General;
  advanced: Advanced;
  drive: Drive;
  appearance: Appearance;
  premium: boolean;
  inAppStatus: InAppStatus;
  development: Development;
}

/** Clips Types */

export interface ClipsState {
  loading: boolean;
  processing: boolean;
  clips: Clip[];
  sync?: 'resolved' | 'rejected' | 'pending';
}

export interface RootState {
  date: number;
  branch: string;
  commit: string;
  version: string;
}
