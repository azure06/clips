import * as storeService from '../services/electron-store';
import { BrowserWindow, ipcMain, screen, globalShortcut } from 'electron';

type MacOS = ['Command', 'Shift', string];
type MacOSFuzzy = ['⌘', 'shift', string];

type WindowsOS = ['Ctrl', 'Alt', string];
type WindowsOSFuzzy = ['ctrl', 'alt', string];

const defaultConfig: MacOS | WindowsOS =
  process.platform === 'darwin'
    ? ['Command', 'Shift', 'V']
    : ['Ctrl', 'Alt', 'V'];

let currentConfig: string | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fromFuzzyShortcut([head, _, tail]: MacOSFuzzy | WindowsOSFuzzy):
  | MacOS
  | WindowsOS {
  return head === '⌘' ? ['Command', 'Shift', tail] : ['Ctrl', 'Alt', tail];
}

function register(
  config: MacOS | WindowsOS = defaultConfig,
  action: () => void
) {
  const nextConfig = config.join('+');
  const result = globalShortcut.register(nextConfig, action);
  if (result) {
    unregister();
    currentConfig = nextConfig;
  }
}

function unregister() {
  if (currentConfig) {
    globalShortcut.unregister(currentConfig);
  }
}

/** Init Shortcuts */
export function initShortcuts(mainWindow: BrowserWindow): void {
  const appConf = storeService.getAppConf();
  const storedShortcut = appConf
    ? fromFuzzyShortcut(appConf.advanced.shortcut)
    : undefined;

  const show = () => {
    const point = screen.getCursorScreenPoint();
    const appConf = storeService.getAppConf();
    // https://github.com/electron/electron/blob/master/docs/api/screen.md
    // const display = screen.getDisplayNearestPoint(point);
    if (appConf && appConf.general.positioningMode.type === 'cursor') {
      const { width, height } = appConf.general.positioningMode;
      mainWindow.setPosition(
        point.x - Math.round(width / 2),
        point.y - Math.round(height / 2)
      );
    }

    mainWindow.show();
  };
  const onShortcutPressed = () =>
    mainWindow.isVisible() ? mainWindow.hide() : show();

  register(storedShortcut, onShortcutPressed);

  ipcMain.handle('set-shortcut', (_, shortcut) =>
    register(fromFuzzyShortcut(shortcut), onShortcutPressed)
  );
}
