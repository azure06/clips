import { BrowserWindow, screen, globalShortcut } from 'electron';
import { HandlerResponse } from '../utils/invocation-handler';
import { AppConfState } from '@/store/types';

export type ShortcutFuzzy = MacOSFuzzy | WindowsOSFuzzy;
export type Shortcut = MacOS | WindowsOS;

type MacOS = ['Command', 'Shift', string];
type MacOSFuzzy = ['⌘', 'shift', string];

type WindowsOS = ['Ctrl', 'Alt', string];
type WindowsOSFuzzy = ['ctrl', 'alt', string];

const defaultConfig: MacOS | WindowsOS =
  process.platform === 'darwin'
    ? ['Command', 'Shift', 'V']
    : ['Ctrl', 'Alt', 'V'];

let currentConfig: Shortcut | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fromFuzzyShortcut([head, _, tail]: MacOSFuzzy | WindowsOSFuzzy):
  | MacOS
  | WindowsOS {
  return head === '⌘' ? ['Command', 'Shift', tail] : ['Ctrl', 'Alt', tail];
}

function unregister(current: Shortcut) {
  globalShortcut.unregister(current.join('+'));
}

// prettier-ignore
function register(action: () => void, config: Shortcut) : boolean {
    return globalShortcut.register(config.join('+'), action);
}

/** Init Shortcuts */

export function shortcutHandler(
  getAppConf: () => AppConfState | undefined,
  mainWindow: BrowserWindow
): (args: ShortcutFuzzy) => Promise<HandlerResponse<ShortcutFuzzy>> {
  const appConf = getAppConf();
  const nextConfig = appConf
    ? fromFuzzyShortcut(appConf.advanced.shortcut)
    : defaultConfig;
  const show = () => {
    const appConf = getAppConf();
    if (appConf && appConf.general.positioningMode.type === 'cursor') {
      // https://github.com/electron/electron/blob/master/docs/api/screen.md
      const point = screen.getCursorScreenPoint();
      const display = screen.getDisplayNearestPoint(point);
      const { width, height } = appConf.general.positioningMode;
      const halfWidth = Math.round(width / 2);
      const halfHeight = Math.round(height / 2);
      const targetX = point.x - halfWidth;
      const targetY = point.y - halfHeight;
      const x =
        point.x + halfWidth > display.bounds.width
          ? display.bounds.width - width
          : point.x - halfWidth < 0
          ? 0
          : targetX;
      const y =
        point.y + halfHeight > display.bounds.height
          ? display.bounds.height - height
          : point.y - halfHeight < 0
          ? 0
          : targetY;
      mainWindow.setPosition(x, y);
    }
    mainWindow.show();
  };

  const result = register(show, nextConfig);
  if (result) currentConfig = nextConfig;

  return (shortcut) => {
    const nextConfig = fromFuzzyShortcut(shortcut);
    const result = register(show, nextConfig)
      ? (() => {
          if (currentConfig) {
            unregister(currentConfig);
            currentConfig = nextConfig;
          }
          return { status: 'success' as const, data: shortcut };
        })()
      : {
          status: 'failure' as const,
          message: 'Failed to register a new shortcut',
        };
    return Promise.resolve(result);
  };
}

// if (isSuccess) {
//   unregister();
//   currentConfig = nextConfig;
// }
