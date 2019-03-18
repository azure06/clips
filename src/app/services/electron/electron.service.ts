import { Injectable } from '@angular/core';

@Injectable()
export class ElectronService {
  get electron(): typeof Electron {
    if (!this.isAvailable) {
      console.warn('Could not load electron ipc');
      return {
        ipcRenderer: {
          send: () => console.warn('Could not load electron ipc'),
          on: () => console.warn('Could not load electron ipc'),
          once: () => console.warn('Could not load electron ipc')
        }
      } as any;
    }
    return (window as any).require('electron');
  }

  get isAvailable() {
    return !!((window as any).require && (window as any).require('electron'));
  }
}
