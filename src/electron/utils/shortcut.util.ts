import { globalShortcut } from 'electron';
import path from 'path';

type MacOS = ['Command', 'Shift', string];
type MacOSFuzzy = ['⌘', 'shift', string];

type WindowsOS = ['Ctrl', 'Alt', string];
type WindowsOSFuzzy = ['ctrl', 'alt', string];

const defaultConfig: MacOS | WindowsOS =
  process.platform === 'darwin' ? ['Command', 'Shift', 'V'] : ['Ctrl', 'Alt', 'V'];

let currentConfig: string | undefined;

export function fromFuzzyShortcut([head, _, tail]: MacOSFuzzy | WindowsOSFuzzy): MacOS | WindowsOS {
  return head === '⌘' ? ['Command', 'Shift', tail] : ['Ctrl', 'Alt', tail];
}

function register(config: MacOS | WindowsOS = defaultConfig, action: () => void) {
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

export default {
  register,
  unregister,
};
