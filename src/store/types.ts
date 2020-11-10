import { ClipDoc as Clip } from '@/rxdb/clips/model';
import { MessageDoc } from '@/rxdb/message/model';
import { RoomDoc } from '@/rxdb/room/model';
import { UserDoc } from '@/rxdb/user/model';

export type Room = RoomDoc & { messages: MessageDoc[] };

export type Loading = {
  user: boolean;
  room: boolean;
  message: boolean;
  devices: boolean;
};

export interface NetworkState {
  status: 'started' | 'closed'; // Server status
  thisUser?: UserDoc;
  users: UserDoc[];
  rooms: Room[];
  loading: Loading;
}

interface Display {
  height: number;
  width: number;
}

interface CursorType extends Display {
  type: 'cursor';
}

interface MaintainType extends Display {
  type: 'maintain';
  position: { x: number; y: number };
}

type MacOSFuzzy = ['⌘', 'shift', string];
type WindowsOSFuzzy = ['ctrl', 'alt', string];
export interface SettingsState {
  drive: {
    sync: boolean;
    threshold: number;
  };
  storage: {
    search: {
      type: 'accurate' | 'fuzzy' | 'advanced-fuzzy';
    };
    optimize: {
      every: number;
    };
    formats: {
      plainText: boolean;
      richText: boolean;
      htmlText: boolean;
      dataURI: boolean;
    };
  };
  appearance: {
    theme: {
      dark: boolean;
    };
  };
  system: {
    display: MaintainType | CursorType;
    notifications: boolean;
    startup: boolean;
    blur: boolean;
    shortcut: MacOSFuzzy | WindowsOSFuzzy;
    language:
      | 'Auto'
      | 'English'
      | 'Italiano'
      | '日本語'
      | '简体中文'
      | '繁體中文';
  };
}

export interface User {
  displayName: string;
  emailAddress: string;
  kind: string;
  me: true;
  permissionId: string;
  photoLink: string;
}

export interface UserState {
  user?: User;
}

export interface ClipsState {
  loading: boolean;
  processing: boolean;
  premium: boolean;
  clips: Clip[];
  sync?: 'resolved' | 'rejected' | 'pending';
}

export interface RootState {
  date: number;
  branch: string;
  commit: string;
  version: string;
}

export { ClipDoc as Clip } from '@/rxdb/clips/model';
